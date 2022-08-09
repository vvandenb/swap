//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Creator: the address who creates a swap
// Completer: the address who completes a swap
contract SwapContract {
  struct Swap {
    address createERC20Address;
    uint256 createERC20Amount;
    address completeERC20Address;
    uint256 completeERC20Amount;
    address creator;
    address completer;
  }
  mapping (address => Swap) public currentSwaps;
  AggregatorV3Interface internal avax_price_feed;
  address payable immutable owner;
  uint256 public fee_usd;
  uint256 public swap_count;

  constructor (address avax_price_oracle, uint256 fee_usd_constructor) {
    owner = payable(msg.sender);
    avax_price_feed = AggregatorV3Interface(avax_price_oracle);
    fee_usd = fee_usd_constructor;
  }

  // MODIFIERS -----
  //Check owner
  modifier _onlyOwner() {
    require(msg.sender == owner, "SWAP: Sender is not owner");
    _;
  }

  //Check for ongoing swap
  modifier _ongoingSwap(address creator) {
    require(currentSwaps[creator].createERC20Address != address(0), "SWAP: No ongoing swap");
    _;
  }

  //Check for NO ongoing swap
  modifier _noOngoingSwap(address creator) {
    require(currentSwaps[creator].createERC20Address == address(0), "SWAP: Ongoing swap");
    _;
  }

  //Check for enough balance and allowance for sent ERC20 token for the Swap CREATOR
  modifier _enoughBalanceAndAllowanceSender(Swap calldata swap) {
    IERC20 token = IERC20(swap.createERC20Address);
    require(token.balanceOf(msg.sender) >= swap.createERC20Amount, "SWAP: Balance not big enough");
    require(token.allowance(msg.sender, address(this)) >= swap.createERC20Amount, "SWAP: Allowance not big enough");
    _;
  }

  //Check for enough balance and allowance for sent ERC20 token for the Swap COMPLETER
  modifier _enoughBalanceAndAllowanceCompleter(Swap storage swap) {
    IERC20 token = IERC20(swap.completeERC20Address);
    require(token.balanceOf(msg.sender) >= swap.completeERC20Amount, "SWAP: Balance not big enough");
    require(token.allowance(msg.sender, address(this)) >= swap.completeERC20Amount, "SWAP: Allowance not big enough");
    _;
  }

  //Check for the swap sender and receiver to not be the same
  modifier _noSelfSwap(Swap calldata swap) {
    require(swap.creator != swap.completer, "SWAP: Sender and receiver are the same");
    _;
  }

  //Check if fee is paid
  modifier _paidFee() {
    require(msg.value >= 1 ether * fee_usd / getAvaxPrice(), 'SWAP: Fee too low');
    _;
  }

  // FUNCTIONS -----
  function getAvaxPrice()
    public
    view
    returns (uint256)
  {
    (,int256 price,,,) = avax_price_feed.latestRoundData();
    uint8 decimals_price = avax_price_feed.decimals();
    uint256 price_avax = uint256(price) * 10 ** (18 - uint256(decimals_price));
    return uint256(price_avax);
  }

  function modifyFeePercentage(uint256 new_fee)
    public
    _onlyOwner()
  {
    fee_usd = new_fee;
  }

  function widthdrawFees()
    public
  {
    owner.transfer(address(this).balance);
  }

  function createSwap(Swap calldata newSwap)
    external
    payable
    _paidFee()
    _enoughBalanceAndAllowanceSender(newSwap)
    _noOngoingSwap(msg.sender)
    _noSelfSwap(newSwap)
  {
    IERC20 token = IERC20(newSwap.createERC20Address);
    token.transferFrom(msg.sender, address(this), newSwap.createERC20Amount);
    currentSwaps[msg.sender] = newSwap;
  }

  function destroySwap()
    external
    _ongoingSwap(msg.sender)
  {
    IERC20 token = IERC20(currentSwaps[msg.sender].createERC20Address);
    token.transfer(msg.sender, currentSwaps[msg.sender].createERC20Amount);
    delete currentSwaps[msg.sender];
  }

  function completeSwap(address sender)
    external
    payable
    _paidFee()
    _ongoingSwap(sender)
    _enoughBalanceAndAllowanceCompleter(currentSwaps[sender])
  {
    require(currentSwaps[sender].completer == msg.sender, "SWAP: swap not meant to be completed by this sender");

    IERC20 token1 = IERC20(currentSwaps[sender].createERC20Address);
    IERC20 token2 = IERC20(currentSwaps[sender].completeERC20Address);
    token1.transfer(currentSwaps[sender].completer, currentSwaps[sender].createERC20Amount);
    token2.transferFrom(currentSwaps[sender].completer, currentSwaps[sender].creator, currentSwaps[sender].completeERC20Amount);
    delete currentSwaps[sender];
    ++swap_count;
  }

  receive() external payable {}
}

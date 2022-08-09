import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { formatUnits } from 'ethers/lib/utils';
import { ethers } from 'hardhat'
import { AVAX_PRICE_MAINNET, AVAX_PRICE_TESTNET, showGas, getGasUsed, deployContract, callFunction } from './constants';

const main = async(): Promise<any> => {
  let silence = false;
  const accounts = await ethers.provider.listAccounts();
  const signers = await ethers.getSigners();
  const oneEth = ethers.utils.parseUnits("1.0", "ether");
  const oneGwei = ethers.utils.parseUnits("1.0", "gwei");
  const oneWei = ethers.utils.parseUnits("1.0", "wei");
  const gasPrice = await ethers.provider.getGasPrice();
  console.log("Gas price:", ethers.utils.formatUnits(gasPrice, "gwei"));

  //DEPLOY
  const Token_1 = await deployContract(signers[0], "FakeERC20", false);
  const token_1_decimals = await Token_1.contract.decimals();
  // const Token_2 = await deployContract(signers[1], "Token18", false);
  // const token_2_decimals = await Token_2.contract.decimals();
  // const fakeOracle = await deployContract(signers[1], "FakeOracle", false);
  const swap = await deployContract(signers[0], "SwapContract", false, undefined, [AVAX_PRICE_TESTNET, ethers.utils.parseEther('0.01')]);
  console.log('----- DEPLOYED -----');

  console.log('Swap contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(swap.address)));

  //APPROVE
  silence = true;
  console.log("Balances:",
    ethers.utils.formatUnits(await Token_1.contract.balanceOf(accounts[0]), token_1_decimals),
    // ethers.utils.formatUnits(await Token_2.contract.balanceOf(accounts[1]), token_2_decimals)
  );
  console.log("Approving 1...");
  await callFunction(Token_1.contract.connect(signers[0]).approve(
    swap.address,
    ethers.constants.MaxUint256,
    {
      // gasPrice: gasPrice,
      maxFeePerGas: ethers.utils.parseUnits('35', 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits('10', 'gwei'),
    }),
    silence
  );
  console.log("Approved:", (await Token_1.contract.allowance(accounts[0], swap.address)).toString());
  // console.log("Approving 2...");
  // await callFunction(Token_2.contract.connect(signers[1]).approve(swap.address, ethers.constants.MaxUint256, {"gasPrice": gasPrice}), silence);
  // console.log("Approved:", (await Token_2.contract.allowance(accounts[1], swap.address)).toString());

  //SWAP
  // silence = false;
  // const fee_usd = await (swap.contract.connect(signers[0]).fee_usd());
  // const avax_price = await (swap.contract.connect(signers[0]).getAvaxPrice());
  // console.log("Creating swap...");
  // await callFunction(swap.contract.connect(signers[0]).createSwap(
  //   [
  //     Token_1.address,
  //     ethers.utils.parseUnits('1', token_1_decimals),
  //     Token_2.address,
  //     ethers.utils.parseUnits('2', token_2_decimals),
  //     accounts[0],
  //     accounts[1]
  //   ],
  //   {
  //     'gasPrice': gasPrice,
  //     'value': ethers.utils.parseEther(ethers.utils.formatEther(ethers.utils.parseEther('1').mul(fee_usd).div(avax_price))),
  //   }
  // ), silence);
  // console.log("Balances:",
  //   ethers.utils.formatUnits(await Token_1.contract.balanceOf(accounts[0]), token_1_decimals),
  //   ethers.utils.formatUnits(await Token_2.contract.balanceOf(accounts[1]), token_2_decimals));
  // console.log("Completing swap...");
  // await callFunction(swap.contract.connect(signers[1]).completeSwap(accounts[0], {
  //   "gasPrice": gasPrice,
  //   'value': ethers.utils.parseEther(ethers.utils.formatEther(ethers.utils.parseEther('1').mul(fee_usd).div(avax_price))),
  // }), silence);
  // console.log("Balances:",
  //   ethers.utils.formatUnits(await Token_1.contract.balanceOf(accounts[0]), token_1_decimals),
  //   ethers.utils.formatUnits(await Token_2.contract.balanceOf(accounts[1]), token_2_decimals));

  // console.log('Swap contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(swap.address)));

  //DESTROY SWAP
  // silence = false;
  // console.log("Destroying swap...");
  // try {
  //   await callFunction(swap.contract.destroySwap({"gasPrice": gasPrice}), silence);
  // } catch (e) {
  //   console.log(e);
  // }
  // console.log("Balances:",
  //   ethers.utils.formatUnits(await Token_1.contract.balanceOf(accounts[0]), token_1_decimals),
  //   ethers.utils.formatUnits(await Token_2.contract.balanceOf(accounts[1]), token_2_decimals));

  //CHECK ONGOING SWAP
  // console.log("Current swap:", await swap.contract.currentSwaps(signers[0].address));

  //WITHDRAW SWAP CONTRACT
  // silence = false;
  // console.log('Swap contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(swap.address)));
  // console.log("Account 0 AVAX:", ethers.utils.formatEther(await ethers.provider.getBalance(accounts[0])));
  // await callFunction(swap.contract.connect(signers[0]).widthdrawFees(), silence);
  // console.log("Account 0 AVAX:", ethers.utils.formatEther(await ethers.provider.getBalance(accounts[0])));
  // console.log('Swap contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(swap.address)));

  //SWAP CONTRACT BALANCE
  // console.log('Swap contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(swap.address)));

  //BURN
  // console.log("Burning...");
  // await callFunction(exampleERC20.contract.burn(accounts[0], oneEth.mul(999), {"gasPrice": gasPrice}));
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})

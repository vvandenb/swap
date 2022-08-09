//SPDX-License-Identifier: MIT
pragma solidity >=0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token6 is ERC20, Ownable {
	string private TOKEN_NAME = "Example ERC20 Token";
	string private TOKEN_SYMBOL = "XMPL";

	uint256 private constant TOTAL_SUPPLY = 10 * 10 ** 6;

	constructor() ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
		_mint(msg.sender, TOTAL_SUPPLY);
	}

	function decimals()
		public
		view
		virtual
		override
	returns (uint8) {
        return 6;
    }

	function mint(address to, uint256 amount)
		public
		onlyOwner
	{
		_mint(to, amount);
	}

	function burn(address from, uint256 amount)
		public
		onlyOwner
	{
		_burn(from, amount);
	}

	/// @notice Query if a contract implements an interface
	/// @param interfaceID The interface identifier, as specified in ERC-165
	/// @return `true` if the contract implements `interfaceID` and
	///  `interfaceID` is not 0xffffffff, `false` otherwise
	function supportsInterface(bytes4 interfaceID)
		external
		pure
		returns (bool)
	{
		if (interfaceID == 0xffffffff || interfaceID == 0x36372b07) {
			return true;
		}
		return false;
	}
}

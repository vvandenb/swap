//SPDX-License-Identifier: MIT
pragma solidity >=0.6.2;

contract FakeERC20 {
	string private TOKEN_NAME = "Fake ERC20 Token";
	string private TOKEN_SYMBOL = "FAK";

	constructor() {}

	function approve(address spender, uint256 amount) public returns (bool) {
        return true;
	}

	function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    )
		public returns (bool)
	{
        return true;
	}

	function decimals()
		public
		pure
	returns (uint8) {
        return 18;
    }

	function balanceOf(address yolo)
		public
		pure
	returns (uint256) {
        return 42 * 10 ** 18;
    }

	function allowance(address test, address test2)
		public
		pure
	returns (uint256) {
        return 33000000000000 * 10 ** 18;
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

    function transfer(address recipient, uint256 amount)
		public returns (bool)
	{
		return true;
	}
}

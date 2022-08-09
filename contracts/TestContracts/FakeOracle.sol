//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FakeOracle {
	function decimals() 
		external
		pure
		returns (uint8)
	{
		return (2);
	}

	function latestRoundData()
		external
		pure
		returns (
			uint80 roundId,
			int256 answer,
			uint256 startedAt,
			uint256 updatedAt,
			uint80 answeredInRound
		)
	{
		return (
			1,
			2900500,
			1,
			1,
			1
		);
	}
}

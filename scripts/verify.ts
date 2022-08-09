var console = require('console');
// import console from 'console'
const hre = require('hardhat')
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat"
import { AVAX_PRICE_MAINNET, AVAX_PRICE_TESTNET, deployContract } from './constants';

async function main() {
  await hre.run('verify:verify', {
    address: '0xC8582Ed6B3A0AE0b9c80af7Bf540D1b1C94670B7',
    constructorArguments: [AVAX_PRICE_MAINNET, ethers.utils.parseEther('0.5')],
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

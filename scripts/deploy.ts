import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat"
import { AVAX_PRICE_MAINNET, AVAX_PRICE_TESTNET, deployContract } from './constants';

const main = async(): Promise<any> => {
  const signers = await ethers.getSigners();
  // const gasPrice = await ethers.provider.getGasPrice();
  const gasPrice = ethers.utils.parseUnits('25', 'gwei');
  console.log("Gas price:", ethers.utils.formatUnits(gasPrice, "gwei"));

  //DEPLOY
  // await deployContract(signers[0], "Token6", false);
  // await deployContract(signers[1], "Token18", false);

  await deployContract(signers[0], "SwapContract", false, undefined, [AVAX_PRICE_MAINNET, ethers.utils.parseEther('0.5')]);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})

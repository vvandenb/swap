import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from "hardhat"

export const AVAX_PRICE_MAINNET = '0x0A77230d17318075983913bC2145DB16C7366156';
export const AVAX_PRICE_TESTNET = '0x5498BB86BC934c8D34FDA08E81D444153d0D06aD';
export const showGas = true;

export const getGasUsed = async (receipt): Promise<any> => {
  console.log('Used', receipt.gasUsed.toString(), 'gas');
}

export const deployContract = async (
  signer: SignerWithAddress,
  contractName: string,
  contractExists: boolean,
  contractAddress?: string,
  contructorArgs?: Array<any>,
) => {
  let contract;
  const contractFactory = await ethers.getContractFactory(contractName);
  if (contractExists) {
    contract = await contractFactory.attach(contractAddress);
  }
  else if (contructorArgs) {
    contract = await contractFactory.connect(signer).deploy(...contructorArgs);
  } else {
    contract = await contractFactory.connect(signer).deploy();
  }
  await contract.deployed();
  const address = contract.address;
  console.log("Contract", contractName, "address:", address);
  if (!contractExists) {
    let receipt = await contract.deployTransaction.wait();
    if (showGas) { getGasUsed(receipt) };
  }
  return { contract, address };
}

export const callFunction = async (functionPromise, silence: boolean) => {
	let tx = await functionPromise;
  let receipt = await tx.wait();
  if (showGas && !silence) { getGasUsed(receipt) };
}

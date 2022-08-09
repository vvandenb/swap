import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { should } from "chai"
import { Signer } from "ethers"
import { shallowCopy } from "ethers/lib/utils"
import { AVAX_PRICE_MAINNET, AVAX_PRICE_TESTNET } from '../scripts/constants'
// Load dependencies
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')
const Web3 = require('web3')

///////////////////////////////////////////////////////////
// SEE https://hardhat.org/tutorial/testing-contracts.html
// FOR HELP WRITING TESTS
// USE https://github.com/gnosis/mock-contract FOR HELP
// WITH MOCK CONTRACT
///////////////////////////////////////////////////////////

const AVAX_ORACLE = AVAX_PRICE_MAINNET
const FEE = '0.5'
const FEE_USD = ethers.utils.parseEther(FEE)

// Start test block
describe('Swap', () => {
  before(async function () {
    this.Token_1 = await ethers.getContractFactory("Token1")
    this.Token_2 = await ethers.getContractFactory("Token18")

    this.signers = await ethers.getSigners()

    this.Swap = await ethers.getContractFactory("SwapContract")
    this.FakeOracle = await ethers.getContractFactory("FakeOracle")
    // this.MockContract = await ethers.getContractFactory("contracts/MockContract.sol:MockContract")
  });

  beforeEach(async function () {
    //Deploy fake oracle
    this.fakeOracle = await this.FakeOracle.deploy()
    await this.fakeOracle.deployed()

    //Deploy swap
    this.swap = await this.Swap.connect(this.signers[0]).deploy(AVAX_ORACLE, FEE_USD)
    await this.swap.deployed()
    this.avax_price = await this.swap.connect(this.signers[1]).getAvaxPrice();
    this.fee_usd = await this.swap.connect(this.signers[1]).fee_usd()
    this.fee = ethers.utils.parseEther(ethers.utils.formatEther(ethers.utils.parseEther('1').mul(this.fee_usd).div(this.avax_price)))

    //Deploy tokens
    this.token_1 = await this.Token_1.connect(this.signers[0]).deploy()
    await this.token_1.deployed()
    this.decimals_1 = await this.token_1.connect(this.signers[0]).decimals()
    await this.token_1.connect(this.signers[0]).approve(this.swap.address, ethers.utils.parseUnits('1000', this.decimals_1))
    this.token_2 = await this.Token_2.connect(this.signers[1]).deploy()
    await this.token_2.deployed()
    this.decimals_2 = await this.token_2.connect(this.signers[1]).decimals()
    await this.token_2.connect(this.signers[1]).approve(this.swap.address, ethers.utils.parseUnits('1000', this.decimals_2))

    this.swap1 = [
      this.token_1.address,
      ethers.utils.parseUnits('1', await this.token_1.decimals()),
      this.token_2.address,
      ethers.utils.parseUnits('2', await this.token_2.decimals()),
      this.signers[0].address,
      this.signers[1].address,
    ]

    // this.mock = await this.MockContract.deploy()
    // await this.mock.deployed()
  });

  describe("Constructor", function () {
    // it('Mock test', async function () {
    //   // If another contract calls balanceOf on the mock contract, return AMT
    //   const balanceOf = Web3.utils.sha3('balanceOf(address)').slice(0,10)
    //   await this.mock.givenMethodReturnUint(balanceOf, 150)
    // });

    it('Check fee', async function () {
      expect(ethers.utils.formatEther(this.fee_usd)).to.equal(FEE)
    });
  });

  describe("Interactions", function () {
    it('Revert destroy non existent swap', async function () {
      expect(this.swap.connect(this.signers[0]).destroySwap())
        .to.be.revertedWith("SWAP: No ongoing swap");
    });

    it('Revert create with invalid fee', async function () {
      expect(this.swap.connect(this.signers[0]).createSwap(this.swap1))
        .to.be.revertedWith("SWAP: Fee too low");
    });

    it('Revert create twice', async function () {
      await this.swap.connect(this.signers[0]).createSwap(this.swap1,
        {
          'value': this.fee,
        })
      expect(this.swap.connect(this.signers[0]).createSwap(this.swap1,
        {
          'value': this.fee,
        }))
        .to.be.revertedWith("SWAP: Ongoing swap");
    });

    it('Complete swap', async function () {
      const balance_1 = await this.token_1.connect(this.signers[0]).balanceOf(this.signers[0].address)
      const balance_2 = await this.token_2.connect(this.signers[1]).balanceOf(this.signers[1].address)
      await this.swap.connect(this.signers[0]).createSwap(this.swap1,
        {
          'value': this.fee,
        })
      await this.swap.connect(this.signers[1]).completeSwap(this.signers[0].address,
        {
          'value': this.fee,
        })
      expect(balance_1.sub(this.swap1[1])).to.equal(await this.token_1.connect(this.signers[0]).balanceOf(this.signers[0].address))
      expect(balance_2.sub(this.swap1[3])).to.equal(await this.token_2.connect(this.signers[1]).balanceOf(this.signers[1].address))
      expect((await this.swap.connect(this.signers[0]).currentSwaps(this.signers[1].address))[0]).to.equal(ethers.constants.AddressZero)
    });

    it('Destroy swap', async function () {
      const balance = await this.token_1.connect(this.signers[0]).balanceOf(this.signers[0].address)
      await this.swap.connect(this.signers[0]).createSwap(this.swap1,
        {
          'value': this.fee,
        })
      await this.swap.connect(this.signers[0]).destroySwap()
      expect(balance).to.equal(await this.token_1.connect(this.signers[0]).balanceOf(this.signers[0].address))
      expect((await this.swap.connect(this.signers[0]).currentSwaps(this.signers[1].address))[0]).to.equal(ethers.constants.AddressZero)
    });
  });

  describe("Owner actions", function () {
    it('Modify fee', async function () {
      await this.swap.connect(this.signers[0]).modifyFeePercentage(ethers.utils.parseEther('2'))
      const fee_usd = await this.swap.connect(this.signers[1]).fee_usd()
      expect(ethers.utils.formatEther(fee_usd)).to.not.equal(FEE)
    });

    it('Revert modify fee', async function () {
      expect(this.swap.connect(this.signers[1]).modifyFeePercentage(ethers.utils.parseEther('2'))).to.revertedWith('SWAP: Sender is not owner')
    });

    it('Withdraw', async function () {
      //Check if even if another sender withdraws, AVAX goes to owner
      const startBalance = await this.signers[0].getBalance()
      await this.signers[1].sendTransaction(
      {
          to: this.swap.address,
          'value': this.fee,
        }
      )
      await this.swap.connect(this.signers[1]).widthdrawFees()
      const endBalance = await this.signers[0].getBalance()
      expect(endBalance).to.not.equal(startBalance)
    });
  });
});

import { exec } from 'child_process'
import { ethers, network } from 'hardhat'
import { GamePair } from '../typechain/GamePair'
import { ERC20 } from '../typechain/ERC20'
import { WETH9 } from '../typechain/WETH9'
import { GSTTOKEN } from '../typechain/GSTTOKEN'
import { GameBallot } from '../typechain/GameBallot'
import { GameFactory } from '../typechain/GameFactory'
import { GameRouter } from '../typechain/GameRouter'
import * as config from '../config'
import { BigNumber, Contract, utils } from 'ethers'
//import { TransactionReceipt } from 'web3-eth';
import { AbiCoder } from 'web3-eth-abi'
import { getOwnerPrivateKey } from '../.privatekey'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import * as boutils from './boutils'
import { GameERC20 } from '../typechain'
import { ConfigAddress, ERC20Token } from '../generated/schema'

const abi: AbiCoder = require('web3-eth-abi')
let main = async () => {
  console.log('network:', network.name)
  let user
  let owner = new ethers.Wallet(getOwnerPrivateKey(network.name), ethers.provider)
  ;[, user] = await ethers.getSigners()

  console.log(
    'deploy account:',
    network.name,
    owner.address,
    ethers.utils.formatEther((await owner.getBalance()).toString())
  )

  let response = await config.GetConfigAddressByGameFactoryAddress(
    network.name,
    config.getGameFactoryAddressByNetwork(network.name)
  )
  let configAddress = JSON.parse(response.body.read().toString()).data.configAddresses[0] as ConfigAddress
  const GSTTOKENFactory = await ethers.getContractFactory('GSTTOKEN')
  //address marketAddress, address omAddress, address adminAddress, address WETHAddress
  const instanceGSTTOKEN = GSTTOKENFactory.connect(owner).attach(
    ((configAddress.gstToken as any) as ERC20Token).id
  ) as GSTTOKEN
  console.log('GSTTOKEN address:', instanceGSTTOKEN.address, configAddress.routerAddress)

  await (
    await instanceGSTTOKEN.approve(configAddress.routerAddress.toString(), ethers.utils.parseEther('100000'))
  ).wait()
  for (let index = 0; index < config.FAUCET_ADDRESSES.length; index++) {
    const faucet_addr = config.FAUCET_ADDRESSES[index]

    await (await instanceGSTTOKEN.transfer(faucet_addr, ethers.utils.parseEther('100000'))).wait()
    console.log(
      instanceGSTTOKEN.address,
      faucet_addr,
      'GST' + ' balance:',
      (await instanceGSTTOKEN.balanceOf(faucet_addr)).toString()
    )

    let faucet_num = ethers.utils.parseEther('100000000.1')
    if (configAddress.usdtToken != '') {
      let tmpToken = (configAddress.usdtToken as any) as ERC20Token
      const USDTFactory = await ethers.getContractFactory('ERC20')
      let instanceUSDT = USDTFactory.connect(owner).attach(tmpToken.id) as ERC20
      if ((await instanceUSDT.balanceOf(faucet_addr)) < faucet_num) {
        await (await instanceUSDT['faucet(address,uint256)'](faucet_addr, faucet_num)).wait()
        console.log(
          'faucet:',
          instanceUSDT.address,
          faucet_addr,
          (await instanceUSDT.symbol()) + ' balance:',
          (await instanceUSDT.balanceOf(faucet_addr)).toString()
        )
      } else {
        console.log(
          instanceUSDT.address,
          faucet_addr,
          (await instanceUSDT.symbol()) + ' balance:',
          (await instanceUSDT.balanceOf(faucet_addr)).toString()
        )
      }
    }
    for (let index = 0; index < configAddress.gameTokens.length; index++) {
        let p = new Promise((resolved, reject) => {

        });
      const element = (configAddress.gameTokens[index] as any) as ERC20Token
      const ERC20Factory = await ethers.getContractFactory('ERC20')
      let instanceERC20 = ERC20Factory.connect(owner).attach(element.id) as ERC20
      if ((await instanceERC20.symbol()) == 'BOST') {
        if ((await instanceERC20.balanceOf(faucet_addr)) < faucet_num) {
          await (
            await instanceERC20['faucet(address,uint256)'](faucet_addr, ethers.utils.parseEther('100000000.1'))
          ).wait()
          //await instanceERC20['faucet(address,uint256)'](owner.address,1e19);
          console.log(
            'faucet:',
            instanceERC20.address,
            faucet_addr,
            (await instanceERC20.symbol()) + ' balance:',
            (await instanceERC20.balanceOf(faucet_addr)).toString()
          )
        } else {
          console.log(
            instanceERC20.address,
            faucet_addr,
            (await instanceERC20.symbol()) + ' balance:',
            (await instanceERC20.balanceOf(faucet_addr)).toString()
          )
        }
      }
    }
  }
}

main()

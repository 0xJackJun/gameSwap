import { exec } from 'child_process';
import { ethers, network } from 'hardhat';
import { ERC20 } from '../typechain/ERC20';
import { WETH9 } from '../typechain/WETH9';
import { GSTTOKEN } from '../typechain/GSTTOKEN';
import { GameBallot } from '../typechain/GameBallot';
import { GameFactory } from '../typechain/GameFactory';
import { GamePair } from '../typechain/GamePair';
import { GameRouter } from '../typechain/GameRouter';
import * as config from '../config';
import { BigNumber, Contract, utils } from 'ethers';
//import { TransactionReceipt } from 'web3-eth';
import { AbiCoder } from 'web3-eth-abi';
import { getOwnerPrivateKey } from '../.privatekey';
import { SigningKey } from '@ethersproject/signing-key';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import * as boutils from './boutils';
import { GameERC20 } from '../typechain';
import { ConfigAddress, ERC20Token } from '../generated/schema';
import { time } from 'node:console';

const abi: AbiCoder = require('web3-eth-abi');
let main = async () => {
  type Hellow = 'Hellow';
  type HellowWorld = '${Hellow} World';
  const funcT = <T>(arr: Array<T>): T => {
    return arr[arr.length - 1];
  };
  let i = funcT<number>([1, 2, 3]);
  console.log('xxxxx:${Hellow}');
  Promise.all([network.name, 1]).then(console.log);
  console.log('network:', network.name);
  let user;
  let owner = new ethers.Wallet(getOwnerPrivateKey(network.name), ethers.provider);
  [, user] = await ethers.getSigners();

  console.log(
    'deploy account:',
    network.name,
    owner.address,
    ethers.utils.formatEther((await owner.getBalance()).toString())
  );
  console.log('xxxxxxxxxx:', config.getGameFactoryAddressByNetwork(network.name));

  let response = await config.GetConfigAddressByGameFactoryAddress(
    network.name,
    config.getGameFactoryAddressByNetwork(network.name)
  );
  let configAddress = JSON.parse(response.body.read().toString()).data.configAddresses[0] as ConfigAddress;

  const GSTTOKENFactory = await ethers.getContractFactory('GSTTOKEN');
  //const instanceGSTTOKEN = GSTTOKENFactory.connect(owner).attach("0xA312F14a8d44d3Af472734513f5366c92bB00De5") as GSTTOKEN;
  const instanceGSTTOKEN = GSTTOKENFactory.connect(owner).attach(
    ((configAddress.gstToken as any) as ERC20Token).id
  ) as GSTTOKEN;
  console.log('GSTTOKEN address:', instanceGSTTOKEN.address);
  const GameRouterFactory = await ethers.getContractFactory('GameRouter');
  const instanceGameRouter = GameRouterFactory.connect(owner).attach(
    configAddress.routerAddress.toString()
  ) as GameRouter;
  //instanceGameRouter.gasEstimates()
  console.log('GameRouter address:', instanceGameRouter.address);

  /*
    {
        const GamePairFactory = await ethers.getContractFactory('GamePair');
        const instanceGamePair = GamePairFactory.connect(owner).attach("0x2EBe0605B59dEd5836bf7B45958Ffce345EB813F") as GamePair;
        console.log('GamePairFactory balanceOfReserve:', (await instanceGSTTOKEN.balanceOf(owner.address)).toString(),(await instanceGSTTOKEN.balanceOf(instanceGamePair.address)).toString(),(await instanceGamePair.balanceOfReserve()).toString());
        let ret = await instanceGameRouter.betForToken(instanceGSTTOKEN.address, "0x2EBe0605B59dEd5836bf7B45958Ffce345EB813F", 1, 2, Date.now() + 86400 - 86400 + 3600);//,{nonce:(await owner.getTransactionCount("pending")) + 1}
    }
    // */

  //let nonce = await owner.getTransactionCount("pending");
  for (let i = 0; i < 3; i++) {
    let deadline = Date.now() + 86400;
    //let factory_address = configAddress.factoryAddress.toString();
    let factory_address = config.getGameFactoryAddressByNetwork(network.name);
    const GameFactoryFactory = await ethers.getContractFactory('GameFactory');
    const instanceGameFactory = GameFactoryFactory.connect(owner).attach(factory_address) as GameFactory;
    console.log(
      network.name,
      factory_address,
      instanceGameFactory.address,
      await instanceGameFactory.getAddress(),
      (await instanceGameFactory.getPledge()).toString()
    );
    let message = await instanceGSTTOKEN.GetPermitString(
      owner.address,
      factory_address,
      ethers.utils.parseEther('0'),
      deadline
    );

    console.log(message);
    console.log(ethers.utils.id(message.data));
    console.log(ethers.utils.keccak256(message.data));

    // Sign the string message
    //let flatSig = await owner.signMessage(ethers.utils.arrayify(message.data));

    // For Solidity, we need the expanded-format of a signature

    const digest_bytes = ethers.utils.arrayify(message.digest);
    //let flatSig = await owner.signMessage(digest_bytes);
    let signingKey = new SigningKey(owner.privateKey);
    let flatSig = signingKey.signDigest(digest_bytes);
    let sig = ethers.utils.splitSignature(flatSig);
    console.log(ethers.utils.recoverAddress(ethers.utils.keccak256(digest_bytes), sig));
    console.log(ethers.utils.recoverAddress(digest_bytes, sig));
    console.log('xxxxxx:', owner.address, await instanceGSTTOKEN.GetPermitAddr(digest_bytes, sig.v, sig.r, sig.s));
    console.log(owner.address, ethers.utils.verifyMessage(message.digest, sig));
    let sig1 = signingKey.signDigest(digest_bytes);
    console.log(ethers.utils.recoverAddress(digest_bytes, sig1));
    let gasprice = await owner.getGasPrice();
    let gaslimit = (await ethers.provider.getBlock('latest')).gasLimit;
    let blockNumber = await ethers.provider.getBlockNumber();
    console.log('gasPrice:', blockNumber, gasprice.toString(), ethers.utils.formatEther(gasprice));
    console.log('gasLimit:', blockNumber, gaslimit.toString(), ethers.utils.formatEther(gaslimit));
    //await instanceGameRouter.setTest("test");
    console.log('xxxxxx:', instanceGameRouter.address, await owner.getTransactionCount('pending'));
    let title = 'test-' + (await ethers.provider.getBlockNumber()).toString();
    let ret = await instanceGameRouter.createGame(
      instanceGSTTOKEN.address,
      [title, 'test', 'test'],
      [deadline - 86400, deadline - 86400 / 2, deadline],
      [1, 1],
      2,
      1,
      sig.v,
      sig.r,
      sig.s
    );
    console.log('instanceGameRouter.createGame waiting ...', await owner.getTransactionCount('pending'));
    let eventFilter = instanceGameRouter.filters.EventCreateGame(null, null, null, null, null, null, null);
    let pair_address: string = '';

    instanceGameRouter.once(eventFilter, (token, pair) => {
      pair_address = pair;
      console.log('new GamePair:', pair);
    });
    //let confirm = await ret.wait(1).catch(err=>console.log);
    let confirm = await ret.wait(1).finally();
    for (let index = 0; index < confirm.events!.length; index++) {
      const element = confirm.events![index];
      if (element.event == 'EventCreateGame' && element.decode) {
        //console.log("wwwwwww:", element.decode(element.data,element.topics));
      }
    }
    console.log(
      'instanceGameRouter.createGame:',
      (await ethers.provider.getBlockNumber()).toString(),
      await owner.getTransactionCount('pending'),
      pair_address
    );
    while (pair_address == '') {
      await instanceGSTTOKEN.balanceOf(owner.address);
    }
    const GamePairFactory = await ethers.getContractFactory('GamePair');
    const instanceGamePair = GamePairFactory.connect(owner).attach(pair_address) as GamePair;
    console.log(
      'GamePairFactory balanceOfReserve:',
      (await instanceGSTTOKEN.balanceOf(owner.address)).toString(),
      (await instanceGSTTOKEN.balanceOf(instanceGamePair.address)).toString(),
      (await instanceGamePair.balanceOfReserve()).toString()
    );
    //owner.getTransactionCount("pending");
    ret = await instanceGameRouter.betForToken(instanceGSTTOKEN.address, pair_address, 1, 1, deadline - 86400 + 3600); //,{nonce:(await owner.getTransactionCount("pending")) + 1}
    console.log('instanceGameRouter.betForToken waiting ...');
    //confirm = await ret.wait(1).then().finally();
    console.log(
      'instanceGameRouter.betForToken:',
      (await ethers.provider.getBlockNumber()).toString(),
      confirm.transactionHash
    );
  }
};

main();

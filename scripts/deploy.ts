import { exec } from 'child_process';
import { ethers,network } from 'hardhat';
import { GamePair } from '../typechain/GamePair';
import { ERC20 } from '../typechain/ERC20';
import { WETH9 } from '../typechain/WETH9';
import { GSTTOKEN } from '../typechain/GSTTOKEN';
import { GameBallot } from '../typechain/GameBallot';
import { GameFactory } from '../typechain/GameFactory';
import { GameRouter } from '../typechain/GameRouter';
import { ConfigAddress } from '../typechain/ConfigAddress';
import * as config from '../config';
import { Contract } from 'ethers';
//import { TransactionReceipt } from 'web3-eth';
import { AbiCoder } from 'web3-eth-abi';
import { getOwnerPrivateKey } from '../.privatekey';
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import * as boutils from './boutils';
import { GameERC20 } from '../typechain';

const abi:AbiCoder = require('web3-eth-abi');
let main = async () => {
    console.log('network:', network.name)
    let user;
    let owner = new ethers.Wallet(getOwnerPrivateKey(network.name), ethers.provider);
    [, user] = await ethers.getSigners();

    console.log('deploy account:', network.name, owner.address, ethers.utils.formatEther((await owner.getBalance()).toString()));

    const ConfigAddressFactory = await ethers.getContractFactory('ConfigAddress');
    let tmpaddr = config.getConfigAddressByNetwork(network.name)
    if (tmpaddr == null) {
        console.error('config address null:',network.name);
        return;
    }
    const instanceConfigAddress = ConfigAddressFactory.connect(owner).attach(tmpaddr) as ConfigAddress;
    console.log('config address:', instanceConfigAddress.address);

    if (instanceConfigAddress.address == "") {
        console.error('config address null:',network.name);
        return;
    }

    let tokens = config.getTokensByNetwork(network.name);
    if (tokens == null) {
        console.error('tokens address null:',network.name);
        return;
    }

    const WETH9Factory = await ethers.getContractFactory('WETH9');
    const instanceWETH9 = (await WETH9Factory.connect(owner).deploy()) as WETH9;
    console.log('new WETH9 address:', instanceWETH9.address);

    const GSTTOKENFactory = await ethers.getContractFactory('GSTTOKEN');
    //address marketAddress, address omAddress, address adminAddress, address WETHAddress
    const instanceGSTTOKEN = (await GSTTOKENFactory.connect(owner).deploy(owner.address,owner.address,owner.address,instanceWETH9.address)) as GSTTOKEN;
    console.log('new GSTTOKEN address:', instanceGSTTOKEN.address);

    const USDTFactory = await ethers.getContractFactory('ERC20');
    let instanceUSDT = (await USDTFactory.connect(owner).deploy("Test BUSDT","BUSDT",6)) as ERC20;
    console.log('new BUSDT address:', instanceUSDT.address,await instanceUSDT['symbol()']());

    const GameBallotFactory = await ethers.getContractFactory('GameBallot');
    //address GST
    const instanceGameBallot = (await GameBallotFactory.connect(owner).deploy(instanceGSTTOKEN.address)) as GameBallot;
    console.log('new GameBallot address:', instanceGameBallot.address);

    const GamePairFactory = await ethers.getContractFactory('GamePair');
    const instanceGamePair = (await GamePairFactory.connect(owner).deploy()) as GamePair;
    console.log('new GamePair address:', instanceGamePair.address);

    const GameFactoryFactory = await ethers.getContractFactory('GameFactory');
    const instanceGameFactory = (await GameFactoryFactory.connect(owner).deploy(instanceGSTTOKEN.address)) as GameFactory;
    //const instance = (await GameFactoryFactory.connect(owner).attach('0x76f601f92A58536001a9Ca69261c194B3111Fa8A')) as GameFactory;
    console.log('new GameFactory address:', instanceGameFactory.address, (await instanceGameFactory.getCodeHash()).slice(2))

    const GameRouterFactory = await ethers.getContractFactory('GameRouter');
    //address _factory, address _gst, address _ballot
    const instanceGameRouter = (await GameRouterFactory.connect(owner).deploy(instanceGameFactory.address,instanceGSTTOKEN.address,instanceGameBallot.address)) as GameRouter;
    console.log('new GameRouter address:', instanceGameRouter.address);


    boutils.ReplaceLine('contracts/libraries/GameLibrary.sol',
        'hex.*\\/\\/8f27dd26047dcc02e6e4b1d15f94c59f5b7c4b3162bb661d3a1e29154c6a2562',
        'hex"' + (await instanceGameFactory.getCodeHash()).slice(2) + '"\\/\\/8f27dd26047dcc02e6e4b1d15f94c59f5b7c4b3162bb661d3a1e29154c6a2562'
        
    );
    //这里保存下地址,方便水龙头等其他使用
    switch(network.name){
        case "ganache":
            boutils.ReplaceLine('config.ts',
                'GAMEFACTORY_ADDRESS_GANACHE.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEFACTORY_ADDRESS_GANACHE = "' + instanceGameFactory.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
            boutils.ReplaceLine('config.ts',
                'GAMEROUTER_ADDRESS_GANACHE.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEROUTER_ADDRESS_GANACHE = "' + instanceGameRouter.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
        case "bsctestnet":
            boutils.ReplaceLine('config.ts',
                'GAMEFACTORY_ADDRESS_BSCTESTNET.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEFACTORY_ADDRESS_BSCTESTNET = "' + instanceGameFactory.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
            boutils.ReplaceLine('config.ts',
                'GAMEROUTER_ADDRESS_BSCTESTNET.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEROUTER_ADDRESS_BSCTESTNET = "' + instanceGameRouter.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
        case "rinkeby":
            boutils.ReplaceLine('config.ts',
                'GAMEFACTORY_ADDRESS_RINKEBY.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEFACTORY_ADDRESS_RINKEBY = "' + instanceGameFactory.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
            boutils.ReplaceLine('config.ts',
                'GAMEROUTER_ADDRESS_RINKEBY.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEROUTER_ADDRESS_RINKEBY = "' + instanceGameRouter.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
        default:
            boutils.ReplaceLine('config.ts',
                'GAMEFACTORY_ADDRESS_BSCTESTNET.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEFACTORY_ADDRESS_BSCTESTNET = "' + instanceGameFactory.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
            boutils.ReplaceLine('config.ts',
                'GAMEROUTER_ADDRESS_BSCTESTNET.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
                'GAMEROUTER_ADDRESS_BSCTESTNET = "' + instanceGameRouter.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
            );
    }

    const wethAddr = config.getTokenAddrBySymbol(tokens,"WBNB");
    console.log('WETH address:', wethAddr);

    const usdtAddr = config.getTokenAddrBySymbol(tokens,"BUSD");
    console.log('BUSD address:', usdtAddr);

    let gasprice = await owner.getGasPrice()
    let gaslimit = (await ethers.provider.getBlock("latest")).gasLimit;
    let blockNumber = await ethers.provider.getBlockNumber()
    console.log("gasPrice:",blockNumber,gasprice.toString(),(ethers.utils.formatEther(gasprice)))
    console.log("gasLimit:",blockNumber,gaslimit.toString(),(ethers.utils.formatEther(gaslimit)))

    //方便目前测试已经部署的业务
    let ret = await (await instanceConfigAddress.upsert(
        instanceGameFactory.address,
        instanceGameRouter.address,
        instanceGSTTOKEN.address,
        instanceWETH9.address,
        instanceUSDT.address,
        "https://data-seed-prebsc-1-s1.binance.org:8545",
        "https://testnet.bscscan.com",
        'Bsc Test NetWork', 97,
    )).wait();
    console.log("instanceConfigAddress.upsert:",ret.transactionHash);
    // */

    //await instanceConfigAddress.updateBlockUrl(instanceConfigAddress.address,"test4");
    if (tokens != null) {
        for (let index = 0; index < tokens.length; index++) {
            const element = tokens[index];
            ret = await (await instanceConfigAddress.upsertGameToken(instanceGameFactory.address, element.symbol, element.address)).wait();
            console.log("instanceConfigAddress.upsertGameToken:", ret.transactionHash);
        }
    }
    const ERC20Factory = await ethers.getContractFactory('ERC20');
    let instanceERC20 = (await ERC20Factory.connect(owner).deploy("Test BOST", "BOST", 18)) as ERC20;
    console.log('GameERC20 address:', instanceERC20.address)
    ret = await (await instanceConfigAddress.upsertGameToken(instanceGameFactory.address, 'BOST', instanceERC20.address)).wait();
    console.log("instanceConfigAddress.upsertGameToken:", ret.transactionHash);



};

main();

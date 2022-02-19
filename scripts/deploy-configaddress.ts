import { exec } from 'child_process';
import { config, ethers,network } from 'hardhat';
import { ConfigAddress } from '../typechain/ConfigAddress';
import { Contract } from 'ethers';
//import { TransactionReceipt } from 'web3-eth';
import { AbiCoder } from 'web3-eth-abi';
import { getOwnerPrivateKey } from '../.privatekey';
import { ReplaceLine } from './boutils';
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { TransactionResponse } from "@ethersproject/abstract-provider";

const abi:AbiCoder = require('web3-eth-abi');
let main = async () => {
    console.log('network:', network.name)
    let user;
    let owner = new ethers.Wallet(getOwnerPrivateKey(network.name), ethers.provider);
    [, user] = await ethers.getSigners();

    console.log('deploy account:', owner.address, ethers.utils.formatEther((await owner.getBalance()).toString()));

    const ConfigAddressFactory = await ethers.getContractFactory('ConfigAddress');
    //const instance = (await ConfigAddressFactory.connect(owner).attach("0xC4DC78d5d00F5d4C1a17d528Ee8e9A3BCFd74CF6"))as ConfigAddress;//0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
    //console.log('ConfigAddress address:', instance.address)
    const instance = (await ConfigAddressFactory.connect(owner).deploy()) as ConfigAddress;
    console.log('ConfigAddress address:', instance.address)
    if (network.name == "bsctestnet") {
        ReplaceLine('config.ts',
            'CONFIGADDRESS_ADDRESS_BSCTESTNET.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
            'CONFIGADDRESS_ADDRESS_BSCTESTNET = "' + instance.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
        );
        ReplaceLine('config.ts',
            'DEPLOY_ACCOUNT_BSCTESTNET.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
            'DEPLOY_ACCOUNT_BSCTESTNET = "' + owner.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
        );
        ReplaceLine('subgraph.yaml',
            'address.*#0x3BCC716d7F478E4eec25647f0A9098E734FF1d32',
            'address: "' + instance.address + '" #0x3BCC716d7F478E4eec25647f0A9098E734FF1d32'
        );
    }else if (network.name == "rinkeby") {
        ReplaceLine('config.ts',
            'CONFIGADDRESS_ADDRESS_RINKEBY.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
            'CONFIGADDRESS_ADDRESS_RINKEBY = "' + instance.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
        );
        ReplaceLine('config.ts',
            'DEPLOY_ACCOUNT_RINKEBY.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
            'DEPLOY_ACCOUNT_RINKEBY = "' + owner.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
        );
        ReplaceLine('subgraph.yaml',
            'address.*#0x3BCC716d7F478E4eec25647f0A9098E734FF1d32',
            'address: "' + instance.address + '" #0x3BCC716d7F478E4eec25647f0A9098E734FF1d32'
        );
    }else if (network.name == "ganache") {
        ReplaceLine('config.ts',
            'CONFIGADDRESS_ADDRESS_GANACHE.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
            'CONFIGADDRESS_ADDRESS_GANACHE = "' + instance.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
        );
        ReplaceLine('config.ts',
            'DEPLOY_ACCOUNT_GANACHE.*\\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9',
            'DEPLOY_ACCOUNT_GANACHE = "' + owner.address + '"; \\/\\/0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9'
        );
        ReplaceLine('subgraph.yaml',
            'address.*#0x3BCC716d7F478E4eec25647f0A9098E734FF1d32',
            'address: "' + instance.address + '" #0x3BCC716d7F478E4eec25647f0A9098E734FF1d32'
        );
    }

    console.log('deploy account:', owner.address, ethers.utils.formatEther((await owner.getBalance()).toString()));
};

main();

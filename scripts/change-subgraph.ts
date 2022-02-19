import { exec } from 'child_process';
import { ethers,network } from 'hardhat';
import { ConfigAddress as ConfigAddressContract } from '../typechain/ConfigAddress';
import { Contract } from 'ethers';
//import { TransactionReceipt } from 'web3-eth';
import { AbiCoder } from 'web3-eth-abi';
import { getOwnerPrivateKey } from '../.privatekey';
import { ReplaceLine } from './boutils';
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { ConfigAddress,ERC20Token } from '../generated/schema';
import * as config from '../config';

const abi:AbiCoder = require('web3-eth-abi');
let main = async () => {
    console.log('network:', network.name)
    let user;
    let owner = new ethers.Wallet(getOwnerPrivateKey(network.name), ethers.provider);
    [, user] = await ethers.getSigners();

    console.log('deploy account:', owner.address, ethers.utils.formatEther((await owner.getBalance()).toString()));

    let response = await config.GetConfigAddressByGameFactoryAddress(network.name,config.getGameFactoryAddressByNetwork(network.name));

    const ConfigAddressFactory = await ethers.getContractFactory('ConfigAddress');
    let tmpaddr = config.getConfigAddressByNetwork(network.name)
    if (tmpaddr == null) {
        console.error('config address null:',network.name);
        return;
    }
    let routeraddr = config.getGameRouterAddressByNetwork(network.name)
    if (routeraddr == null) {
        console.error('gamerouter address null:',network.name);
        return;
    }
    const instanceConfigAddress = ConfigAddressFactory.connect(owner).attach(tmpaddr) as ConfigAddressContract;
    console.log('config address:', instanceConfigAddress.address);
    console.log('ConfigAddress address:', instanceConfigAddress.address)
    if (network.name == "bsctestnet") {
        ReplaceLine('subgraph.yaml',
            'address.*#{{CONFIGADDRESS_ADDRESS}}',
            'address: "' + instanceConfigAddress.address + '" #{{CONFIGADDRESS_ADDRESS}}'
        );
        ReplaceLine('subgraph.yaml',
            'address.*#{{GAMEROUTER_ADDRESS}}',
            'address: "' + routeraddr + '" #{{GAMEROUTER_ADDRESS}}'
        );
        ReplaceLine('subgraph.yaml',
            'startBlock.*#{{STARTBLOCK}}',
            'startBlock: ' + config.getStartBlockNumber(network.name) + ' #{{STARTBLOCK}}'
        );

    }else if (network.name == "rinkeby") {
        ReplaceLine('subgraph.yaml',
            'address.*#{{CONFIGADDRESS_ADDRESS}}',
            'address: "' + instanceConfigAddress.address + '" #{{CONFIGADDRESS_ADDRESS}}'
        );
        ReplaceLine('subgraph.yaml',
            'address.*#{{GAMEROUTER_ADDRESS}}',
            'address: "' + routeraddr + '" #{{GAMEROUTER_ADDRESS}}'
        );
        ReplaceLine('subgraph.yaml',
            'startBlock.*#{{STARTBLOCK}}',
            'startBlock: ' + config.getStartBlockNumber(network.name) + ' #{{STARTBLOCK}}'
        );
    }else if (network.name == "ganache") {
        ReplaceLine('subgraph.yaml',
            'address.*#{{CONFIGADDRESS_ADDRESS}}',
            'address: "' + instanceConfigAddress.address + '" #{{CONFIGADDRESS_ADDRESS}}'
        );
        ReplaceLine('subgraph.yaml',
            'address.*#{{GAMEROUTER_ADDRESS}}',
            'address: "' + routeraddr + '" #{{GAMEROUTER_ADDRESS}}'
        );
        ReplaceLine('subgraph.yaml',
            'startBlock.*#{{STARTBLOCK}}',
            'startBlock: ' + config.getStartBlockNumber(network.name) + ' #{{STARTBLOCK}}'
        );
    }


};

main();

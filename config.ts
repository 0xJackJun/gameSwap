
import fetch,{Response} from 'node-fetch';

// ConfigAddree 地址
export const CONFIGADDRESS_ADDRESS_GANACHE = "0x3ca28b46685fA9014fd7D574A438E49f78dEb138"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEFACTORY_ADDRESS_GANACHE = "0xd257766F6Ba54B6904009109a681487b31dEc51a"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEROUTER_ADDRESS_GANACHE = "0x7ecaD6fA0Ce61e43e1a02E2B9D64BA03BaCC41Db"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const DEPLOY_ACCOUNT_GANACHE = "0xf1b5311FC420643f15F7983f204763516c43B514"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9

export const CONFIGADDRESS_ADDRESS_BSCTESTNET = "0x8F41dE1f52146b55926Da63bfC95c816C8f1Ed99"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEFACTORY_ADDRESS_BSCTESTNET = "0xd257766F6Ba54B6904009109a681487b31dEc51a"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEROUTER_ADDRESS_BSCTESTNET = "0x7ecaD6fA0Ce61e43e1a02E2B9D64BA03BaCC41Db"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const DEPLOY_ACCOUNT_BSCTESTNET = "0x66f040c34C9bA21560952303AfF336dA12096ad2"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9

export const CONFIGADDRESS_ADDRESS_BSC = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEFACTORY_ADDRESS_BSC = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEROUTER_ADDRESS_BSC = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const DEPLOY_ACCOUNT_BSC = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9

export const CONFIGADDRESS_ADDRESS_RINKEBY = "0xD1E1E4EbCBeB57e015A8212aB7Cc779f3095Dd8C"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEFACTORY_ADDRESS_RINKEBY = "0xd257766F6Ba54B6904009109a681487b31dEc51a"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEROUTER_ADDRESS_RINKEBY = "0x7ecaD6fA0Ce61e43e1a02E2B9D64BA03BaCC41Db"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const DEPLOY_ACCOUNT_RINKEBY = "0xf6c0570D6edDF4A73ef61d707a5caCD1e0be564D"; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9

export const CONFIGADDRESS_ADDRESS_MAINNET = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEFACTORY_ADDRESS_MAINNET = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const GAMEROUTER_ADDRESS_MAINNET = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9
export const DEPLOY_ACCOUNT_MAINNET = ""; //0x83f238F8a8F557dEdE7aE201434f5FB3bC2dE1F9

export const TOKENS_BSC_TESTNET = [
    {symbol:'tUSDC',address:'0x0b2af20b7ef759b1540a8844740bfe7ef4e5d1de'},
    {symbol:'BUSD',address:'0x0b2af20b7ef759b1540a8844740bfe7ef4e5d1de'},
    {symbol:'WBNB',address:'0xae13d989dac2f0debff460ac112a837c89baa7cd'},
];

export const TOKENS_BSC = [
    {symbol:'USDC',address:'0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'},
    {symbol:'WBNB',address:'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095'},
    {symbol:'Cake',address:'0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'},
];

export const TOKENS_RINKEBY = [
];

export const TOKENS_MAINNET = [
];
export const TOKENS_GANACHE = [
];

export const FAUCET_ADDRESSES = [
    "0x176791d147bEf3f62Dadde535604f339a1758E44", //来福
    "0x22F6Be7444e42f43F5d93CC729545af974A2CD62", //pg
    "0xf1b5311FC420643f15F7983f204763516c43B514", //pgg
];

export const TOKENS = {
    bsctestnet:TOKENS_BSC_TESTNET,
    bsc:TOKENS_BSC,
    rinkeby:TOKENS_RINKEBY,
    mainnet:TOKENS_MAINNET,
    ganache:TOKENS_GANACHE,
}
export function getTokensByNetwork(name: string) :Array<{symbol:string,address:string}>|null {
    switch(name){
        case "bsctestnet":
            return TOKENS_BSC_TESTNET;
        case "bsc":
            return TOKENS_BSC;
        case "rinkeby":
            return TOKENS_RINKEBY;
        case "mainnet":
            return TOKENS_MAINNET;
        case "ganache":
            return TOKENS_GANACHE;
    }
    return null;
}

export function getTokenAddrBySymbol(tokens:Array<{symbol:string,address:string}>,symbol: string) :string {
    for (let index = 0; index < tokens.length; index++) {
        const element = tokens[index];
        if (element.symbol == symbol) {
            return element.address;
        }
    }
    return "";
}

export function getConfigAddressByNetwork(name: string) :string|null {
    switch(name){
        case "ganache":
            return CONFIGADDRESS_ADDRESS_GANACHE;
        case "bsctestnet":
            return CONFIGADDRESS_ADDRESS_BSCTESTNET;
        case "bsc":
            return CONFIGADDRESS_ADDRESS_BSC;
        case "rinkeby":
            return CONFIGADDRESS_ADDRESS_RINKEBY;
        case "mainnet":
            return CONFIGADDRESS_ADDRESS_MAINNET;
    }
    return null;
}
export function getGameRouterAddressByNetwork(name: string) :string|null {
    switch(name){
        case "ganache":
            return GAMEROUTER_ADDRESS_GANACHE;
        case "bsctestnet":
            return GAMEROUTER_ADDRESS_BSCTESTNET;
        case "bsc":
            return GAMEROUTER_ADDRESS_BSC;
        case "rinkeby":
            return GAMEROUTER_ADDRESS_RINKEBY;
        case "mainnet":
            return GAMEROUTER_ADDRESS_MAINNET;
    }
    return null;
}
export function getGameFactoryAddressByNetwork(name: string) :string {
    switch(name){
        case "ganache":
            return GAMEFACTORY_ADDRESS_GANACHE;
        case "bsctestnet":
            return GAMEFACTORY_ADDRESS_BSCTESTNET;
        case "bsc":
            return GAMEFACTORY_ADDRESS_BSC;
        case "rinkeby":
            return GAMEFACTORY_ADDRESS_RINKEBY;
        case "mainnet":
            return GAMEFACTORY_ADDRESS_MAINNET;
    }
    return GAMEFACTORY_ADDRESS_BSCTESTNET;
}
export function getStartBlockNumber(name: string) :number {
    //let blockNumber = await ethers.provider.getBlockNumber()
    switch(name){
        case "ganache":
            return 0;
        case "bsctestnet":
            return 8160000;
        case "bsc":
            return 0;
        case "rinkeby":
            return 8471670;
        case "mainnet":
            return 0;
    }
    return 0;
}
export function  GetConfigAddressByGameFactoryAddress(name: string, addr: string): Promise<Response> {
    let where = "";
    if (addr != "") {
        where = 'where:{id:\\\"' + addr.toLowerCase() + '\\\"},'
    }
    let url = "http://10.0.0.18:7000/subgraphs/name/fatter-bo/gameswap-subgraph";
    switch(name){
        case "ganache":
            url = "http://127.0.0.1:8000/subgraphs/name/fatter-bo/gameswap-subgraph";
        case "bsctestnet":
        case "bsc":
        case "rinkeby":
        case "mainnet":
    }
    return fetch(url, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "content-type": "application/json"
        },
        "body": '{"query":"{configAddresses(' + where + 'subgraphError:allow,orderBy:timestamp,orderDirection:desc,first:2){id  factoryAddress routerAddress gstToken{id} wethToken{id} usdtToken{id} networkName  blockUrl  gameTokens{    id    symbol  }}}","variables":null,"operationName":null}',
        "method": "POST"
    //}).then(response => {
    //    return JSON.parse(response.body.read().toString());
    });
}

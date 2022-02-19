// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract ConfigAddress {
  event UpsertGameToken(address indexed factoryAddress,address indexed tokenAddress,string tokenSymbol);
  event UpsertConfig(address indexed factoryAddress,address indexed routerAddress,address gstToken,address wethToken,address usdtToken,string rpcUrl,string blockUrl,string networkName,uint256 indexed chainId);
  struct Config {
    // 工厂合约地址
    address factoryAddress;
    // 外围路由合约 Router
    address routerAddress;
    // 保证金合约地址
    address gstToken;
    // WETH合约地址
    address wethToken;
    // USDT合约地址
    address usdtToken;
    // 区块浏览器地址
    string blockUrl;
    // RPC地址
    string rpcUrl;
    // 网络名称
    string networkName;
    // chain_id
    uint256 chainId;
    // 其他用来游戏的代币也可以随时配置添加
    mapping(string => address) gameTokenMap;
  }

  mapping(address => Config) public configMap;

  address private _owner;

  constructor() {
    _owner = msg.sender;
  }

  //插入更新
  function upsert(address factoryAddress,address routerAddress,address gstToken,address wethToken,address usdtToken,string memory rpcUrl,string memory blockUrl,string memory networkName,uint256 chainId) public {
    require(_owner == msg.sender, "only owner can upsert");
    require(factoryAddress != address(0),"factoryAddress invalid");
    require(routerAddress != address(0),"routerAddress invalid");
    require(gstToken != address(0),"gstToken invalid");
    require(wethToken != address(0),"wethToken invalid");
    require(usdtToken != address(0),"usdtToken invalid");
    Config storage config = configMap[factoryAddress];
    config.factoryAddress = factoryAddress;
    config.routerAddress = routerAddress;
    config.wethToken = wethToken;
    config.gstToken = gstToken;
    config.usdtToken = usdtToken;
    config.blockUrl = blockUrl;
    config.rpcUrl = rpcUrl;
    config.networkName = networkName;
    config.chainId = chainId;
    emit UpsertConfig(factoryAddress,routerAddress,gstToken,wethToken,usdtToken,rpcUrl,blockUrl,networkName,chainId);
  }

  function updateRouterAddress(address factoryAddress,address routerAddress) public {
    Config storage config  = configMap[factoryAddress];
    upsert(config.factoryAddress,routerAddress,config.gstToken,config.wethToken,config.usdtToken,config.rpcUrl,config.blockUrl,config.networkName,config.chainId);
  }

  /*
  function getConfig(address factoryAddress) public view returns(Config storage config) {
    return config = configMap[factoryAddress];
  }
  // */

  function updateGstToken(address factoryAddress,address gstToken) public {
    Config storage config  = configMap[factoryAddress];
    upsert(config.factoryAddress,config.routerAddress,gstToken,config.wethToken,config.usdtToken,config.rpcUrl,config.blockUrl,config.networkName,config.chainId);
  }

  function updateWethToken(address factoryAddress,address wethToken) public {
    Config storage config  = configMap[factoryAddress];
    upsert(config.factoryAddress,config.routerAddress,config.gstToken,wethToken,config.usdtToken,config.rpcUrl,config.blockUrl,config.networkName,config.chainId);
  }

  function updateUsdtToken(address factoryAddress,address usdtToken) public {
    Config storage config  = configMap[factoryAddress];
    upsert(config.factoryAddress,config.routerAddress,config.gstToken,config.wethToken,usdtToken,config.rpcUrl,config.blockUrl,config.networkName,config.chainId);
  }

  function updateRpcUrl(address factoryAddress,string memory rpcUrl) public {
    Config storage config  = configMap[factoryAddress];
    upsert(config.factoryAddress,config.routerAddress,config.gstToken,config.wethToken,config.usdtToken,rpcUrl,config.blockUrl,config.networkName,config.chainId);
  }

  function updateBlockUrl(address factoryAddress,string memory blockUrl) public {
    Config storage config  = configMap[factoryAddress];
    upsert(config.factoryAddress,config.routerAddress,config.gstToken,config.wethToken,config.usdtToken,config.rpcUrl,blockUrl,config.networkName,config.chainId);
  }

  function upsertGameToken(address factoryAddress,string memory tokenSymbol,address tokenAdress) public {
    require(_owner == msg.sender, "only owner can upsertGameToken");
    Config storage config  = configMap[factoryAddress];
    config.gameTokenMap[tokenSymbol] = tokenAdress;
    emit UpsertGameToken(factoryAddress,tokenAdress,tokenSymbol);
  }
  function getGameToken(address factoryAddress,string memory tokenSymbol) public view returns(address) {
    Config storage config  = configMap[factoryAddress];
    return config.gameTokenMap[tokenSymbol];
  }
}

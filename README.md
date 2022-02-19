# 目录结构说明

```bash
├── Dockerfile #Dock环境
├── README.md #说明
├── abis #输出合约abi文件,前端和脚本用
├── compile.sh #hardhat 编译合约
├── contracts #逻辑合约都写这里
│   ├── test #测试合约
│   └── utils #工具集
├── deploy-bsctestnet.sh #部署到bsctestnet
├── deploy-configaddress.sh #配置文件部署
├── deploy.sh #带参数部署,默认部署ganache
├── docker-compose-up.sh #启动thegraph本地环境
├── docker-compose.yml #thegraph docker配置
├── findexp #文件查找工具
├── hardhat.config.ts.example #hardhat配置参考
├── init-docker-compose.sh #初始化thegraph docker
├── init-subgraph.sh #初始化thegraph
├── init.sh #初始化环境
├── package.json #node配置
├── run-bsctestnet.sh #执行ts脚本
├── run.sh #执行ts脚本
├── scripts #ts脚本都写这里
├── tenderly.sh #tenderly调试发布脚本
├── tenderly.yaml.example #调试发布脚本参考
├── test #mocha单元测试叫本
├── test.sh #指定单个测试脚本文件
└── truffle-config.js.example #truffle配置,因为tenderly需要用truffle
```

# Quick Start


环境:node,yarn,ganache,solidity 0.8.3



**下载**

```bash
git clone https://github.com/fatter-bo/gameswap-subgraph.git
cd gameswap-subgraph
yarn install
```



**配置**

```bash
cp hardhat.config.ts.example hardhat.config.ts
# ganache: http://127.0.0.1:7545
# localhost: http://127.0.0.1:8545
# bsctestnet: https://data-seed-prebsc-2-s3.binance.org:8545

cp truffle-config.js.example truffle-config.js

cp tenderly.yaml.example tenderly.yaml

#配置部署账号私钥部分,ganache有点问题没解决，先写死了，需要手工处理
cp .privatekey.ts.example .privatekey.ts

```



**Docker开发环境**

```bash

# 编辑docker-compose.yml
# ethereum: 'mainnet:http://host.docker.internal:7545'
# 默认用宿主机的ganache客户端
./init-docker-compose.sh #第一次部署

./docker-compose-up.sh #启动pg数据库，ipfs，graph-node

./init-docker-dev.sh  #第一次部署
./docker.sh

```



**编译**

```bash
# 如果docker环境 先进入./docker.sh
cd /gameswap/

#编译
./compile.sh
```



**部署**

```bash
./deploy.sh # 部署合约

./deploy-configaddress.sh #部署配置文件

./init-subgraph.sh # 部署thegraph

./deploy.sh # 2次部署合约,这里为了配置文件同步,有点冗余还在想办法

#修改config.ts 增加测试地址FAUCET_ADDRESSES
./run.sh scripts/faucet.ts # 给账号增加各种测试币

#增加测试数据,创建游戏,增加代币等
./run.sh scripts/test.ts
```



**测试**

http://127.0.0.1:8000/subgraphs/name/fatter-bo/gameswap-subgraph/graphql

**日志调试**

https://github.com/fatter-bo/hardcatstudy/blob/master/contracts/study/StudyDelegate.sol
https://github.com/fatter-bo/hardcatstudy/blob/master/scripts/StudyDelegate.ts
npx  hardhat run scripts/StudyDelegate.ts

注意只能用hardhat网络,其他网络

---

**VSCode插件**

1. Formatting Toggle

   保存自动格式化

2. Prettier Formatter for Visual Studio Code

   格式化工具

3. Solidity support for Visual Studio code

   语法高亮,提示,编译

4. VSCodeVim

   vim vscode插件,各种强大

---

**常用参考资料**

https://etherscan.io/

https://infura.io/

https://testnet.bscscan.com/

https://dashboard.tenderly.co/

https://thegraph.com/

https://github.com/graphprotocol

https://github.com/ethers-io/ethers.js


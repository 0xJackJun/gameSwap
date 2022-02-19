#!/bin/bash

npx hardhat run --network ganache  ./scripts/deploy.ts
#npx hardhat run --network bsctestnet  ./scripts/deploy-bsctestnet.ts
#npx hardhat run --network bsc  ./scripts/deploy.ts

# 部署完后因为地址发生了变化,必须要重新执行init-subgraph.sh
sh init-subgraph.sh


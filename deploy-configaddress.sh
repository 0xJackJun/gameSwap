#!/bin/bash

case $1 in

        bsctestnet)
        npx hardhat run ./scripts/deploy-configaddress.ts --network $1
        ;;

        rinkeby)
        npx hardhat run ./scripts/deploy-configaddress.ts --network $1
        ;;

        *)
        npx hardhat run ./scripts/deploy-configaddress.ts --network ganache
        ;;
esac

# 部署完后因为地址发生了变化,必须要重新执行init-subgraph.sh
sh init-subgraph.sh


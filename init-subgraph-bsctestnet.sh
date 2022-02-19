#!/bin/bash


#truffle compile

#truffle network --clean
#truffle migrate


#sed -i -e   's/0x2E645469f354BB4F5c8a05B3b30A929361cf77eC/<CONTRACT_ADDRESS>/g'  subgraph.yaml

#sh compile.sh

#yarn 

npx hardhat run --network bsctestnet scripts/change-subgraph.ts

yarn graph:codegen

yarn graph:create-bsctest

yarn graph:deploy-bsctest

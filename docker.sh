#!/usr/bin/env bash

docker rm gameswap_dev_ganache
docker run -it -v $(pwd):/gameswap --name gameswap_dev_ganache gameswap_dev_ganache:latest /bin/bash

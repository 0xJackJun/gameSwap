#!/usr/bin/env bash

set -e

if ! which docker 2>&1 > /dev/null; then
    echo "Please install 'docker' first"
    exit 1
fi

if ! which docker-compose 2>&1 > /dev/null; then
    echo "Please install 'docker-compose' first"
    exit 1
fi

if ! which jq 2>&1 > /dev/null; then
    echo "Please install 'jq' first"
    exit 1
fi

docker-compose up 


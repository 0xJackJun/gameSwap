FROM node:latest
MAINTAINER fatter

#RUN sed -i 's/archive.ubuntu.com/mirrors.163.com/' /etc/apt/sources.list
#RUN sed -i 's/archive.ubuntu.com/mirrors.ustc.edu.cn/' /etc/apt/sources.list
RUN apt-get -y update
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get install -y \
    libsecret-1-dev \
    vim \
    git \
    gawk 

RUN npm install -g ganache-cli
RUN npm install -g truffle

#CMD ["ganache-cli", "--port=7545","--account='0xe0bd337765bccdf449db8435212ce9ec0bd87a22af4822c859e7a8dfebcbf18e,10000000000000000000'"]

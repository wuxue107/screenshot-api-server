FROM node:12-stretch-slim
MAINTAINER 575065955@qq.com


COPY latest.tar /

RUN \
    echo "deb http://mirrors.cloud.tencent.com/debian stretch main\ndeb http://mirrors.cloud.tencent.com/debian-security stretch/updates main\ndeb http://mirrors.cloud.tencent.com/debian stretch-updates main" >/etc/apt/sources.list \
    && apt-get clean all && apt-get update \
    && apt-get install -y xfonts-75dpi xfonts-intl-chinese xfonts-wqy \
    && apt-get install -y libnspr4 libnss3 libexpat1 libfontconfig1 libuuid1 \
    && npm config set registry https://registry.npm.taobao.org -g \
    && npm config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g \
    && npm cache clean --force && yarn cache clean --force \
    && tar -xvf latest.tar && cd /screenshot-api-server && yarn install \
    && npm cache clean --force && yarn cache clean --force \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


EXPOSE 3000
ENV PATH /headless-shell:/usr/local/bin:$PATH

ENTRYPOINT cd /screenshot-api-server && yarn start

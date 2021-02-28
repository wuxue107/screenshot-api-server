FROM node:12-stretch-slim
MAINTAINER 575065955@qq.com


COPY latest.tar /

RUN \
    apt-get update \
    && apt-get install -y xfonts-75dpi xfonts-intl-chinese xfonts-wqy \
    && npm config set registry https://registry.npm.taobao.org -g \
    && npm config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g \
    && unzip latest.tar && cd /scrrenshop-api-server && yarn install \
    && npm cache clean --force && yarn cache clean --force \
    && apt-get clean all && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \

EXPOSE 3000
ENV PATH /headless-shell:/usr/local/bin:$PATH

ENTRYPOINT cd /scrrenshop-api-server && yarn start

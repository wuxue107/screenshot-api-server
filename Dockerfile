FROM node:12-stretch-slim
MAINTAINER 575065955@qq.com

## docker build -t registry.cn-shanghai.aliyuncs.com/nop/bookjs-server:0.0.1 .
## docker run -td --name bookjs-server -v ${PWD}:/bookjs registry.cn-shanghai.aliyuncs.com/nop/bookjs-server:0.0.1

##     echo "deb https://mirrors.cloud.tencent.com/debian stable main\ndeb https://mirrors.cloud.tencent.com/debian-security stable/updates main\ndeb https://mirrors.cloud.tencent.com/debian stable-updates main" >/etc/apt/sources.list && \

RUN \
    apt-get update \
    && apt-get install -y curl git xfonts-75dpi xfonts-intl-chinese xfonts-wqy && mkfontscale && mkfontdir && fc-cache \
    && npm config set registry https://registry.npm.taobao.org -g \
    && npm config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g \
    # && npm install -g yarn \
    && npm cache clean --force && yarn cache clean --force \
    && mkdir /scrrenshop-api-server \
    && curl -sL https://gitee.com/wuxue107/screenshot-api-server/repository/archive/master.zip >/tmp/screenshop-api-server.zip \
    && tar -xzvf /tmp/screenshop-api-server.zip /scrrenshop-api-server \
    && apt-get clean all && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \




EXPOSE 3000
ENV PATH /headless-shell:/usr/local/bin:$PATH

ENTRYPOINT /scrrenshop-api-server && yarn start

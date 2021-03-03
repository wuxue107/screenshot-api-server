FROM chromedp/headless-shell:89.0.4381.8
MAINTAINER 575065955@qq.com

#     && curl -sL https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb >/tmp/wkhtmltox_0.12.6-1.buster_amd64.deb && dpkg -i /tmp/wkhtmltox_0.12.6-1.buster_amd64.deb \
#     && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
RUN \
    sed -i 's/deb.debian.org/mirrors.cloud.tencent.com/g;s/security.debian.org/mirrors.cloud.tencent.com/g;s/security.debian.org/mirrors.cloud.tencent.com/g' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install  --no-install-recommends -y nodejs curl xfonts-intl-chinese ttf-wqy-microhei  xfonts-wqy fonts-arphic-ukai fonts-cwtex-fs fonts-symbola xfonts-intl-european xfonts-intl-japanese \
    && npm config set registry https://registry.npm.taobao.org -g \
    && npm config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g \
    && npm install -g yarn \
    && tar -xvf latest.tar && cd /screenshot-api-server && mkdir public && yarn install \
    && npm cache clean ---force && yarn cache clean --force \
    && rm -rf latest.tar && apt-get clean all && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* 

EXPOSE 9222 3000

VOLUME /screenshot-api-server/public

ENV PATH /headless-shell:/usr/local/bin:$PATH

ENTRYPOINT (/headless-shell/headless-shell --no-sandbox --headless --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 &) && sleep 2 && cd /screenshot-api-server && yarn start

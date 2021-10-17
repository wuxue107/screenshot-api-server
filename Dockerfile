FROM wuxue107/screenshot-api-base
MAINTAINER 575065955@qq.com

COPY latest.tar /

RUN \
    tar -xvf latest.tar && rm -rf latest.tar && cd /screenshot-api-server && rm -rf public && mkdir -p public && yarn install \
    && yarn cache clean --force \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && apt-get clean all


EXPOSE 3000

VOLUME /screenshot-api-server/public

ENTRYPOINT chmod 777 /screenshot-api-server/*.sh && /screenshot-api-server/run.sh

FROM wuxue107/screenshot-api-base:1.1.0
MAINTAINER 575065955@qq.com

COPY latest.tar /

RUN \
    tar -xvf latest.tar && rm -rf latest.tar && cd /screenshot-api-server && rm -rf public && mkdir -p public && yarn install \
    && chmod 777 /screenshot-api-server/*.sh \
    && yarn cache clean --force \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && apt-get clean all
    


EXPOSE 3000

VOLUME /screenshot-api-server/public

ENTRYPOINT /screenshot-api-server/run.sh

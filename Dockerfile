FROM node:12-stretch-slim
MAINTAINER 575065955@qq.com


COPY latest.tar /

RUN \
    sed -i 's/deb.debian.org/mirrors.cloud.tencent.com/g;s/security.debian.org/mirrors.cloud.tencent.com/g;s/security.debian.org/mirrors.cloud.tencent.com/g' /etc/apt/sources.list \
    && apt-get clean all && apt-get update \
    && apt-get install --no-install-recommends -y \
      wget xfonts-intl-chinese ttf-wqy-microhei  xfonts-wqy fonts-arphic-ukai fonts-cwtex-fs fonts-symbola xfonts-intl-european xfonts-intl-japanese \
      libnspr4 libnss3 libexpat1 libfontconfig1 libuuid1 \
      xz-utils dbus libg2-dev libnspr4 libnss3 libexpat1 libfontconfig1 libuuid1 adwaita-icon-theme at-spi2-core dconf-gsettings-backend dconf-service fonts-liberation glib-networking glib-networking-common glib-networking-services gsettings-desktop-schemas libasound2 libasound2-data libatk-bridge2.0-0 libatspi2.0-0 \
      libcolord2 libdconf1 libdrm-amdgpu1 libdrm-intel1 libdrm-nouveau2 libdrm-radeon1 libdrm2 libegl1-mesa libepoxy0  libgbm1 \
      libgl1-mesa-dri libgl1-mesa-glx libglapi-mesa libgtk-3-0 libgtk-3-bin libgtk-3-common  \
      libjson-glib-1.0-0 libjson-glib-1.0-common libllvm3.9 \
      libnspr4 libnss3 libpciaccess0 libproxy1v5 librest-0.7-0 libsensors4 libsoup-gnome2.4-1 libsoup2.4-1 libtxc-dxtn-s2tc libvulkan1 libwayland-client0 \
      libwayland-cursor0 libwayland-egl1-mesa libwayland-server0 libx11-xcb1 libxaw7 libxcb-dri2-0 libxcb-dri3-0 libxcb-glx0 libxcb-present0 libxcb-shape0 libxcb-sync1 libxcb-xfixes0 libxft2 libxkbcommon0 \
      libxmu6 libxmuu1 libxshmfence1 libxtst6 libxv1 libxxf86dga1 libxxf86vm1 x11-utils xdg-utils xkb-data \
    && npm config set registry https://registry.npm.taobao.org -g \
    && npm config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g \
    && tar -xvf latest.tar && rm -rf latest.tar && cd /screenshot-api-server && mkdir -p public && yarn install \
    && yarn cache clean --force \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /etc/rc.*/*dbus \
    && apt-get clean all


EXPOSE 3000


ENV PATH /usr/local/bin:$PATH
ENV NODE_ENV production

VOLUME /screenshot-api-server/public

ENTRYPOINT chmod 777 /screenshot-api-server/*.sh && /screenshot-api-server/run.sh

FROM node:10

ARG BUILD_DEPS=" \
    build-essential"

ARG RUN_DEPS=" \
    nodejs"

# nodeJS setup script also runs apt-get update
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install --no-install-suggests --no-install-recommends -y \
        $BUILD_DEPS \
        $RUN_DEPS && \
    rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash bookbrainz

ARG BB_ROOT=/home/bookbrainz/bookbrainz-site
WORKDIR $BB_ROOT
RUN chown bookbrainz:bookbrainz $BB_ROOT

# Files necessary to complete the JavaScript build
COPY scripts/ scripts/
COPY .babelrc ./
COPY package.json ./
COPY package-lock.json ./
COPY webpack.client.js ./
RUN npm run mkdirs
RUN npm install --no-audit

# Clean up files that aren't needed for production
RUN apt-get remove -y $BUILD_DEPS && \
    apt-get autoremove -y

COPY static/ static/
COPY config/ config/
COPY src/ src/

CMD ["npm", "start"]
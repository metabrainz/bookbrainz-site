FROM metabrainz/consul-template-base:v0.18.5-1

ARG BUILD_DEPS=" \
    build-essential \
    git"

ARG RUN_DEPS=" \
    nodejs"

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update
RUN apt-get install --no-install-suggests --no-install-recommends -y \
        $BUILD_DEPS \
        $RUN_DEPS
RUN rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash bookbrainz

ARG BB_ROOT=/home/bookbrainz/bookbrainz-site
WORKDIR $BB_ROOT
RUN chown bookbrainz:bookbrainz $BB_ROOT

# Files necessary to complete the JavaScript build
COPY scripts/ scripts/
COPY src/ src/
COPY static/ static/
COPY .babelrc ./
COPY package.json ./

RUN npm install
RUN npm run mkdirs
RUN npm run prestart

# Clean up files that aren't needed for production
RUN npm prune --production
RUN rm -rf scripts/ src/ .babelrc package.json

COPY docker/config.json.ctmpl ./

# Remove once we're converted away from jade
COPY templates/ templates/

RUN chown -R bookbrainz:bookbrainz $BB_ROOT

COPY docker/bookbrainz.service /etc/service/bookbrainz/run
COPY docker/consul-template-bookbrainz.conf /etc/
COPY docker/bookbrainz /usr/local/bin/

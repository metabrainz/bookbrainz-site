FROM metabrainz/node:10 as bookbrainz-base

ARG DEPLOY_ENV

ARG BUILD_DEPS=" \
    build-essential \
    git \
    python-dev \
    libpq-dev"

RUN apt-get update && \
    apt-get install --no-install-suggests --no-install-recommends -y \
        $BUILD_DEPS && \
    rm -rf /var/lib/apt/lists/*

# PostgreSQL client
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
ENV PG_MAJOR 9.5
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ jessie-pgdg main' $PG_MAJOR > /etc/apt/sources.list.d/pgdg.list
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-$PG_MAJOR \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash bookbrainz

ARG BB_ROOT=/home/bookbrainz/bookbrainz-site
WORKDIR $BB_ROOT
RUN chown bookbrainz:bookbrainz $BB_ROOT

# Files necessary to complete the JavaScript build
COPY scripts/ scripts/
COPY .babelrc ./
COPY .eslintrc.js ./
COPY .eslintignore ./
COPY webpack.client.js ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install --no-audit

# Clean up files that aren't needed for production
RUN apt-get remove -y $BUILD_DEPS && \
    apt-get autoremove -y

COPY static/ static/
RUN npm run mkdirs
COPY config/ config/
COPY src/ src/

# Copy css/less dependencies from node_modules to src/client/stylesheets
RUN npm run copy-client-scripts


FROM bookbrainz-base as bookbrainz-dev
ARG DEPLOY_ENV


FROM bookbrainz-base as bookbrainz-prod
ARG DEPLOY_ENV

COPY ./docker/consul-template-webserver.conf /etc/consul-template-webserver.conf
COPY ./docker/$DEPLOY_ENV/webserver.service /etc/service/webserver/run
RUN ./node_modules/less/bin/lessc --include-path=./node_modules/bootstrap/less ./src/client/stylesheets/style.less > ./static/stylesheets/style.css

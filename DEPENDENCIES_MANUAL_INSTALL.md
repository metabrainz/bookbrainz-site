# Installing dependencies manually

If you don't want to use Docker for the dependencies, here are the steps you will need to take to get your local environment up and running.

For setting up and running the NodeJS server outside of Docker, read the instructions [here](./NODEJS_SETUP.md)



## PostgreSQL
BookBrainz uses version 12.3.

To get PostgreSQL, use one of the following commands:

**Debian-based OS**

    sudo apt-get install postgresql

**Red Hat-based OS**

    sudo yum install postgresql-server

To install Redis, run similar commands to get the dependency from your package
manager:

**Debian-based OS**

    sudo apt-get install redis-server

**Red Hat-based OS**

    sudo yum install redis


## Elasticsearch

To install Elasticsearch, follow [this helpful guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-16-04) for Linux-based systems or the [official instructions](
https://www.elastic.co/guide/en/elasticsearch/reference/6.3/install-elasticsearch.html).

The BookBrainz server has been tested with ElasticSearch version 6.3.2.

## Setting up Dependencies

No setup is required for Redis or Elasticsearch. However, it is necessary to
perform some initialization for PostgreSQL and import the latest BookBrainz
database dump.

Firstly, begin downloading the [latest BookBrainz dump](http://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2).

Then, uncompress the `latest.sql.bz2` file, using the bzip2 command:

    bzip2 -d latest.sql.bz2

This will give you a file that you can restore into PostgreSQL, which will
set up data identical to the data we have on the bookbrainz.org website. First, you must create the necessary role and database with these two commands:

	psql -h localhost -U postgres --command="CREATE ROLE bookbrainz"	
	psql -h localhost -U postgres --command="CREATE DATABASE bookbrainz"

Then you can restore the database from the lates dump you dowloaded. To do
this, run:

    psql -h localhost -U postgres -d bookbrainz -f latest.sql

At this point, the database is set up, and the following command should give
you a list of usernames of BookBrainz editors (after entering the password from
earlier):

    psql -h localhost -U postgres bookbrainz --command="SELECT name FROM bookbrainz.editor"

You are also required to set the password of your local PostgreSQL instance.
You can do this by


    psql -h localhost -U postgres

    postgres=# \password

This will set the password to your PostgreSQL, which you will need to set in the `config/config.json` database section.

<h1 align="center">
  <br>
  <a href="https://bookbrainz.org"><img src="https://github.com/metabrainz/metabrainz-logos/blob/master/logos/BookBrainz/PNG/BookBrainz_logo.png" alt="BookBrainz"></a>
</h1>
<h4 align="center">Server for the BookBrainz project</h4>
<p align="center">
    <img src="https://github.com/metabrainz/bookbrainz-site/actions/workflows/ci.yml/badge.svg?branch=master"
         alt="CI status">
    <img src="https://github.com/metabrainz/bookbrainz-site/actions/workflows/test-report.yml/badge.svg?branch=master"
         alt="Tests status">
    <img src="https://coveralls.io/repos/github/bookbrainz/bookbrainz-site/badge.svg?branch=master)](https://coveralls.io/github/bookbrainz/bookbrainz-site?branch=master"
         alt="Coverage status">
	<a href="https://codeclimate.com/github/bookbrainz/bookbrainz-site">
		<img src="https://api.codeclimate.com/v1/badges/76f87309d52d75ff4a18/maintainability"
         alt="Maintainability">
	</a>
	<a href="https://www.browserstack.com/">
		<img src="https://bookbrainz.org/images/BrowserStack.svg" height="20px"></img>
	</a>
</p>
<p align="center">
  <a href="https://bookbrainz.org">Website</a> •
  <a href="https://bookbrainz-dev-docs.readthedocs.io/">Documentation</a> •
  <a href="https://tickets.metabrainz.org/projects/BB/issues">Bug tracker</a>
</p>


<hr>
This repository contains the code for the BookBrainz web site. The directories
are arranged as follows:

* `config` - the config to be used when running the site; copy the example files
  and edit, dropping the `.example` suffix.
* `docker` - deployment files and configurations
* `scripts` - scripts used during the development and deployment of BookBrainz.
* `sql` - PostgreSQL database schemas and migration files—formerly separated in https://github.com/bookbrainz/bookbrainz-sql
* `src` - node.js source files defining the site logic and user interface.
* `static` - static files which are served by node as part of the site.
* `test` - unit tests and functional tests for the site.

Additionally, after building the client JavaScript (see below), the following
directories will exist:

* `lib` - compiled and minified server files
* `static/stylesheets` - the CSS generated from compiling the project LESS files
  (`src/client/stylesheets`).
* `static/js` - minified JavaScript files which are referred to by the site
  pages.
  
## Contact and updates

Any questions? You can get in contact with the community on [our IRC channel](https://kiwiirc.com/nextclient/irc.libera.chat/?#bookbrainz) or [our forums](https://community.metabrainz.org/c/bookbrainz), or send us [an email](mailto:bookbrainz@metabrainz.org)

Breaking changes to the database schema or our API will be announced on
[our blog](https://blog.metabrainz.org/category/bookbrainz/), along with our other major updates,
so consider following that.


## Contributing
We welcome any and all contributions ! Whether you want to add or improve entries on [bookbrainz.org](https://bookbrainz.org), fix an issue on the website or provide new functionality, we'll be happy to have your help and count you part of our ranks !
If you are new to open source contribution workflows, have a look at [this beginner's guide](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/) and our [contribution guidelines](CONTRIBUTING.md).
Looking for existing issues, or to report a new bug you found? Head to our ticket tracker at https://tickets.metabrainz.org/projects/BB !
Still not sure what to start with? Have a look at [tickets tagged **good-first-bug**](https://tickets.metabrainz.org/issues/?jql=project%20%3D%20BB%20AND%20status%20in%20(Open%2C%20Reopened)%20AND%20resolution%20%3D%20Unresolved%20AND%20labels%20%3D%20good-first-bug%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC)

### Setting up a local BookBrainz server

For instruction on how to [set up and configure a local BookBrainz instance](https://bookbrainz-dev-docs.readthedocs.io/en/latest/docs/installation.html), as well as [troubleshooting common issues](https://bookbrainz-dev-docs.readthedocs.io/en/latest/docs/troubleshooting.html) and setting up testing, please visit our developer docs: https://bookbrainz-dev-docs.readthedocs.io

## Documentation

The developer documentation can be found at https://bookbrainz-dev-docs.readthedocs.io

We also have a user guide for the website https://bookbrainz-user-guide.readthedocs.io

The inline documentation found in this repository is served alongside on Github Pages: https://metabrainz.github.io/bookbrainz-site

Our contributing guidelines can be found [here](CONTRIBUTING.md).

<br/>

## Beta and test subdomains

We have two separate subdomains for the purpose of testing and rolling out beta features.
You can sign in with the same account as the one you use on the main website.

__[beta.bookbrainz.org](https://beta.bookbrainz.org)__ uses the main database but with a newer version of the code that hasn't been released yet. It is used to test new features.

__[test.bookbrainz.org](https://test.bookbrainz.org)__: all changes made to this subdomain are not in sync with the main database and vice versa.
This domain is for you to tinker with all features of the website freely without having to verify the correctness of the data you enter. This comes in handy if that's all you need to do instead of having to set up BookBrainz locally.
This subdomain is used for testing only and the data is not maintained or updated. It is not guaranteed that any of the data will be authentic.

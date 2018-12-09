# Installation Troubleshooting (along with some tips and tricks) 

* General

    1. It's better for you if you do some package catalog update by 

	Ubuntu
	
    `sudo apt update`
	
	2. Error: `Can't open input file latest.tar.bz2: No such file or directory` 
	After downloading the data dumps, you may realize that an attempt to uncompress it using the command `bzip2 -d  	latest.tar.bz2` doesn’t work and gives the above error. 
	
	It can be solved by giving the actual path of the latest.tar.bz2 file in place of the file name such as:
	
  `/ home/user/Desktop/latest.tar.bz2`
  
  3. Error: `fatal: unable to access 'https://github.com/path/to/repo.git/': gnutls_handshake() failed: Error in the pull function` after entering the `git clone --recursive https://github.com/bookbrainz/bookbrainz-site.git` command. 
  
  At this point, you should check your internet connection. If it persists, make sure you are not working behind a proxy.

* ElasticSearch

    1. ElasticSearch requires runtime Java installed on your local machine, 
	so you have to install it by
	
	Ubuntu
	
    `sudo apt install default-jre`

    And then check it if it have installed already

    `java -version`

    2. When you run ElasticSearch, it seems that the process takes a very long time. 
	To proceed the process, just let ElasticSearch to run
    on its own terminal, and proceed the building process by making another window of terminal


* Redis

    -

* PostgreSQL

    1. After instaling, the username will be made by the machine.
    - To set the password of SQL (You'll need this later), run

    `sudo -u postgres psql`

    then 
    ```
    psql (9.6.9)
    Type "help" for help.

    postgres=# \password
    Enter new password:
    ```

    - To figure out the username, do

    `sudo psql -U postgres -W -h localhost`

    then

    `Password for user <username>: ` 
	
	will appear.
    Use the username for the config later on config.json.

* NodeJS/NPM

    1. If you got no idea about installing NodeJS, install them by:
	Ubuntu
	
    `curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
     sudo apt install nodejs`

    2. When filling out the requirements of BookBrainz, you'll encounter an error that says you'll need to install postgresql-server-dev-X.Y for building a server-side extension or libpq-dev for building a client-side application
    To solve this problem, please install libpq-dev and node-gpy
	
	Ubuntu
	
    `sudo apt install -y node-gyp libpq-dev`



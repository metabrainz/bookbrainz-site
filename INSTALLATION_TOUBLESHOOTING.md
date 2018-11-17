# Troubleshooting installation errors

Here, you can find some possible errors which may arise when installing the BookBrainz server locally. 
Possible solutions to these errors have been added as well. 

* Error: `Unable to locate package <package name>` when trying to install a package (such as entering "sudo apt-get install redis-server").
This error could occur as a result of entering a non-existent package name. Or it could just occur otherwise. 
A simple solution is to run: `sudo apt-get update` before trying the install commands. 

* Error: `Can't open input file latest.tar.bz2: No such file or directory`
After downloading the data dumps, you may realize that an attempt to uncompress it using the command `bzip2 -d latest.tar.bz2` doesn’t work and gives the above error.
It can be solved by giving the actual path of the latest.tar.bz2 file in place of the file name such as:
  `/ home/user/Desktop/latest.tar.bz2`

* Error: `fatal: unable to access 'https://github.com/path/to/repo.git/': gnutls_handshake() failed: Error in the pull function`
after entering the `git clone --recursive https://github.com/bookbrainz/bookbrainz-site.git` command. 
At this point, you should check your internet connection. If it persists, make sure you are not working behind a proxy. 

* Error: `You need to install postgresql-server-dev-X.Y for building a server-side extension or libpq-dev for building a client-side application`
This error may show up at one point in the installation process. You can fix it by running the commands:
  `sudo apt-get install python-psycopg2`
  `sudo apt-get install libpq-dev`

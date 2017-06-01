# water-serious-game
A multi player online serious game for water engineers. You can upload towns distributed water systems in epanet format, visualise them in 3d, set up game situations as a dungeon master, make teams of users with different and complementary roles, and have the teams compete to solve problems. Two games: the team based modena game, and the single player aqualibrium game are present.

At the moment, the hydraulic simulator that goes with the game works for the nyc and the aqualibrium game on both linux ubuntu and windows. The modena game executable only works for windows for now, but a linux version will come in a coupke of weeks.



////////////////////////////
installation on LINUX UBUNTU 
////////////////////////////

1- install linux ubuntu on your machine. Your have defined a username with admin privileges - let's call hime <myuser>... You also have decided of the same password called <mypassword> that you will use for both the redis and the postgresql database servers.
2- start installing the postgresql server:
 
> sudo apt-get update
> sudo apt-get install postgresql postgresql-contrib
3- check that the postgresql server is live by doing:
sudo -u postgres psql
It should give you some sort of command line looking like :

> psql (9.5.6)
> Type "help" for help.
>
> postgres=#

Type \q and enter to leave...

4- add a <myuser> user to the postgresql server just in case you want to do things with it uder your user name...
> sudo -u postgres createuser --interactive
You will have to reply to the questions by giving your <myuser> name, give it admin privileges, and make sure the password  is <mypassword>.

5- create a databse called wds for the purpose of the game...
> sudo -u postgres createdb wds

6- change the postgres user password to <mypassword>
> sudo -u postgres psql
then type: \password postgres
and enter <mypassword> when prompted

7 - I suggest you install pgadmin III via the ubuntu software app and check that you indeed have a wds database created... (when starting it press the "add a conection to server" big button on the left side, name your connection like you like, name the host localhost, and ass <mypassword> in the password section). This way you will have a fast and easy way to edit the database.

8 - install the redis server:

> wget http://download.redis.io/redis-stable.tar.gz
> tar xvzf redis-stable.tar.gz 
> cd redis-stable/
> make
> make test
> sudo make install
> sudo mkdir /etc/redis

9 - edit the redis.conf file by changing lines in 3 places as follow:


. . .
>
> If you run Redis from upstart or systemd, Redis can interact with your
> supervision tree. Options:
>   supervised no      - no supervision interaction
>   supervised upstart - signal upstart by putting Redis into SIGSTOP mode
>   supervised systemd - signal systemd by writing READY=1 to $NOTIFY_SOCKET
>   supervised auto    - detect upstart or systemd method based on
>                        UPSTART_JOB or NOTIFY_SOCKET environment variables
> Note: these supervision methods only signal "process is ready."
>       They do not enable continuous liveness pings back to your supervisor.
supervised systemd
>
. . .

. . .
>
> The working directory.
>
> The DB will be written inside this directory, with the filename specified
> above using the 'dbfilename' configuration directive.
>
> The Append Only File will also be created inside this directory.
>
> Note that you must specify a directory here, not a file name.
dir /var/lib/redis
>
. . .

. . .
>################################# SECURITY ###################################
>
> Require clients to issue AUTH <PASSWORD> before processing any other
> commands.  This might be useful in environments in which you do not trust
> others with access to the host running redis-server.
>
> This should stay commented out for backward compatibility and because most
> people do not need auth (e.g. they run their own servers).
>
> Warning: since Redis is pretty fast an outside user can try up to
> 150k passwords per second against a good box. This means that you should
> use a very strong password otherwise it will be very easy to break.
>
>requirepass <mypassword>
>
. . .



10- copy the edited redis configuration file at the right place: 
> sudo cp redis.conf /etc/redis/redis.conf

11- edit a redis service config file

> sudo gedit /etc/systemd/system/redis.service

Add the following content to the file, save, and close editor:

>[Unit]
>Description=Redis In-Memory Data Store
>After=network.target
>
>[Service]
>User=<myuser>
>Group=<myuser>
>ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
>ExecStop=/usr/local/bin/redis-cli shutdown
>Restart=always
>
>[Install]
>WantedBy=multi-user.target

12- finish some stuff before starting the redis service:

> sudo mkdir /var/lib/redis
> sudo chown <myuser>:<myuser> /var/lib/redis
> sudo chmod 770 /var/lib/redis
> sudo systemctl start redis
> sudo systemctl status redis

13- test if redis service is running

> redis-cli -a <mypassword>

then type : ping and enter
it should reply "PONG"... type exit and enter...

14- go where the serious game folder has been extracted and start installing node.js related stuff:
e.g. cd Documents/myseriousgame/

> sudo apt install nodejs
> sudo apt install nodejs-legacy
> sudo apt install npm
> sudo npm install sails -g
> sudo npm install forever -g
> npm install

15- in the serious game folder, edit 2 files:

config/connections.js

...
>/***************************************************************************
>  *                                                                          *
>  * PostgreSQL is another officially supported relational database.          *
>  * http://en.wikipedia.org/wiki/PostgreSQL                                  *
>  *                                                                          *
>  * Run: npm install sails-postgresql                                        *
>  *                                                                          *
>  *                                                                          *
>  ***************************************************************************/
>  somePostgresqlServer: {
>    adapter: 'sails-postgresql',
>    host: 'localhost',
>    user: 'postgres',
>	port: 5432,
>	poolSize: 10,
>	ssl: false,
>    password: '<mypassword>',
>    database: 'wds'
>  }
>...


config/sessions.js
...
>adapter: 'redis',
>
>  /***************************************************************************
>  *                                                                          *
>  * The following values are optional, if no options are set a redis         *
>  * instance running on localhost is expected. Read more about options at:   *
>  * https://github.com/visionmedia/connect-redis                             *
>  *                                                                          *
>  *                                                                          *
>  ***************************************************************************/
>
>  host: 'localhost',
>  port: 6379,
>  ttl: 7200,
>  db: 0,
>  pass: '<mypassword>',
>  prefix: 'sess:',
...

16 - (finally) run the game server.
You can either use:
> sudo sails lift --port 80
or 
> sudo forever node app.js --port 80
if you want the game server to start in a forever process that would restart immmediately if the server was to close because of a problem...
   
You can now try the game if you open your chrome or chromium browser at the address: localhost
For further steps on how to configure and play games see youtube video https://youtu.be/GushFK9RWBs


///////////////////////
installation on WINDOWS
///////////////////////
1- You have decided to use the same password called <mypassword> that you will use for both the redis and the postgresql database servers.
2- install a REDIS database server for windows 
Go to and download at :
https://github.com/MSOpenTech/redis/releases

3- change REDIS configuration file to add password:
Go to the Program Files\Redis folder and change redis.windows-service.conf file.
Make sure to uncomment the line with "requirepass" and write down your database password
requirepass <mypassword>

4- restart REDIS :
restart the Redis service (Run -\> services.msc -\> Redis -\> Restart).

5- install the postgresql database server
go to https://www.bigsql.org/postgresql/installers.jsp/ and download the graphical installer.
Just add <mypassword> when prompted (following on site instructions at https://www.bigsql.org/docs/installwindows/installwin)

6- configure postgresql :
Open psql to start working with PostgreSQL. You will see the following:

$ psql -U postgres
psql (9.6beta1)
Type "help" for help"

postgres=#

Create a database:

To create your "wds" database, enter the following:

postgres=# create database wds;
CREATE DATABASE
You can now connect to the database "wds"

postgres=# \c wds;
You are now connected to database "mydb" as user "postgres".
mydb=#

type \q to exit the database command line.

14- go where the serious game folder has been extracted and start installing node.js related stuff:
e.g. cd Documents/myseriousgame/
Go to  https://nodejs.org/en/ and download and install a recent stable version of node.js.
Open a command line and type:
sudo npm install sails -g
sudo npm install forever -g
npm install

15- in the serious game folder, edit 2 files:

config/connections.js

...
/***************************************************************************
  *                                                                          *
  * PostgreSQL is another officially supported relational database.          *
  * http://en.wikipedia.org/wiki/PostgreSQL                                  *
  *                                                                          *
  * Run: npm install sails-postgresql                                        *
  *                                                                          *
  *                                                                          *
  ***************************************************************************/
  somePostgresqlServer: {
    adapter: 'sails-postgresql',
    host: 'localhost',
    user: 'postgres',
	port: 5432,
	poolSize: 10,
	ssl: false,
    password: '<mypassword>',
    database: 'wds'
  }
...


config/sessions.js
...
adapter: 'redis',

  /***************************************************************************
  *                                                                          *
  * The following values are optional, if no options are set a redis         *
  * instance running on localhost is expected. Read more about options at:   *
  * https://github.com/visionmedia/connect-redis                             *
  *                                                                          *
  *                                                                          *
  ***************************************************************************/

  host: 'localhost',
  port: 6379,
  ttl: 7200,
  db: 0,
  pass: '<mypassword>',
  prefix: 'sess:',
...

16 - (finally) run the game server.
You can either use:
sudo sails lift --port 80
or 
sudo forever node app.js --port 80
if you want the game server to start in a forever process that would restart immmediately if the server was to close because of a problem...

You can now try the game if you open your chrome or chromium browser at the address: localhost.
For further steps on how to configure and play games see youtube video https://youtu.be/GushFK9RWBs



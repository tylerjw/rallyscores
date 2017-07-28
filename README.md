# rallyscores
Scraper and website for comparing scores from rally events

# AWS Install

0. Update apt-get
    $ sudo apt-get update
1. Install compilers and libraries
    $ sudo apt-get install build-essential
    $ sudo apt-get install zlib1g-dev libbz2-dev libreadline6 libreadline6-dev libssl-dev sqlite3 libsqlite3-dev python3 python3-pip

2. Clone repo and install dependencies
    $ git clone https://github.com/tylerjw/rallyscores.git
    $ sudo pip3 install scrapy pymongo scrapyd-client daterangeparser

3. Install mongodb
    $ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    $ echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    $ sudo apt-get update
    $ sudo apt-get install -y mongodb-org
    $ sudo service mongod start
    $ sudo systemctl enable mongod

4. Install scrapyd
    $ sudo -i
    # useradd -r -s /bin/false scrapy
    # mkdir /var/log/scrapyd
    # mkdir /etc/scrapyd
    # mkdir /var/lib/scrapyd
    # chown -R scrapy /var/lib/scrapyd
    # chown -R scrapy /var/log/scrapyd

Copy this into /etc/systemd/system/scrapyd.service

[Unit]
Description=scrapyd
After=network.target

[Service]
User=root
ExecStart=/usr/local/bin/scrapyd -u scrapy -g nogroup -l /var/log/scrapyd/scrapyd.log

[Install]
WantedBy=multi-user.target

Copy this into /etc/scrapyd/scrapyd.conf

[scrapyd]
http_port  = 6800
debug      = off
max_proc  = 4
eggs_dir   = /var/lib/scrapyd/eggs
dbs_dir    = /var/lib/scrapyd/dbs
items_dir  = /var/lib/scrapyd/items
logs_dir   = /var/log/scrapyd
jobs_to_keep = 5
max_proc_per_cpu = 4
finished_to_keep = 100
poll_interval = 5.0
bind_address = 127.0.0.1
runner      = scrapyd.runner
application = scrapyd.app.application
launcher    = scrapyd.launcher.Launcher
webroot     = scrapyd.website.Root

[services]
schedule.json     = scrapyd.webservice.Schedule
cancel.json       = scrapyd.webservice.Cancel
addversion.json   = scrapyd.webservice.AddVersion
listprojects.json = scrapyd.webservice.ListProjects
listversions.json = scrapyd.webservice.ListVersions
listspiders.json  = scrapyd.webservice.ListSpiders
delproject.json   = scrapyd.webservice.DeleteProject
delversion.json   = scrapyd.webservice.DeleteVersion
listjobs.json     = scrapyd.webservice.ListJobs
daemonstatus.json = scrapyd.webservice.DaemonStatus

Start the service and verify it works then install it so it starts automatically
    # systemctl start scrapyd
    # systemctl status scrapyd
    # systemctl enable scrapyd

Test you can interact with it:
    $ curl http://localhost:6800/daemonstatus.json
returns:
{"finished": 0, "node_name": "ip-172-31-0-90", "status": "ok", "running": 0, "pending": 0}

5. Test deploying scrapy project
    $ cd ~/rallyscores/timecontrol
    $ scrapyd-deploy -a

6. Register domain:
https://aws.amazon.com/getting-started/tutorials/get-a-domain/

7. Setup nodejs server
    $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    $ sudo apt-get install -y nodejs
    $ npm install

Test running the server (sudo needed for port 80)
    $ sudo npm run watch

8. Setup indexes in mongo database
    $ mongo
    > use rally
    > db.ra_events.createIndex({year: -1, event_code: 1})
    > db.rallyamerica.createIndex({year: -1, event_code: 1})

Notes:
+ Delete all elements in a mongodb collection:
    db.collection.deleteMany({})

TODO:
1. Stop caching ra page data once the site is live (10 min cache)





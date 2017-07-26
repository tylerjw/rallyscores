# rallyscores
Scraper and website for comparing scores from rally events

# AWS Install

0. Update apt-get
    $ sudo apt-get update
1. Install compilers and libraries
    $ sudo apt-get install build-essential
    $ sudo apt-get install zlib1g-dev libbz2-dev libreadline6 libreadline6-dev libssl-dev sqlite3 libsqlite3-dev
2. Install pyenv
    $ curl -L https://raw.githubusercontent.com/pyenv/pyenv-installer/master/bin/pyenv-installer | bash
2.1 follow instructions to copy lines into .bashrc then source .bashrc
2.2 Update
    $ pyenv update
3. Install python 
    $ pyenv install 3.6.2
4. Clone repo and install dependencies
    $ git clone https://github.com/tylerjw/rallyscores.git
    $ pyenv global 3.6.2
    $ pip install scrapy pymongo

5. Install mongodb
    $ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    $ echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    $ sudo apt-get update
    $ sudo apt-get install -y mongodb-org
    $ sudo service mongod start
    $ sudo systemctl enable mongod

6. Install scrapyd
    $ sudo -i
    # sudo apt-get install python3 python3-pip
    # pip3 install scrapyd
    # useradd -r -s /bin/false scrapy
    # mkdir /var/log/scrapyd
    # mkdir /etc/scrapyd

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





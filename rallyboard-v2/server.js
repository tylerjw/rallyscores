const express = require('express');
const mongodb = require('mongodb')
const request = require('request');

const app = express();
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

const mongo_url = 'mongodb://localhost:27017/rally'
const mongo = mongodb.MongoClient()

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

let is_live = function(event) {
  let today = new Date()
  let yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  if ("start" in event) {
    if(event.start >= today) {
      let end = event.start
      if ("end" in event) {
        end = event.end
      }
      if(end <= yesterday) {
        return true
      }
    }
  }
  return false
}

let events_data;
let updateEventsData = () => {
  try {
    mongo.connect(mongo_url, (err, db) => {
      if (err) {
        console.log('Unable to connect to database server', err);
      } else {
        let collection = db.collection('ra_events');
        let results = collection.find({},{'sort': {'start':-1}});
        results.toArray((err, data) => {
          if (err) {
            console.log('Unable to get events from database', err);
          } else if (data) {
            let parentEvents = {};
            let years = new Set();
            for (let event of data) {
              if (event['type'] === 'parent') {
                if (event.year in parentEvents) {
                  if (is_live(event)) {
                    event['live'] = 'LIVE event'
                  }
                  parentEvents[event.year].push(event)
                } else {
                  parentEvents[event.year] = [event]
                }
                years.add(event.year)
              }
            }
            years = Array.from(years).sort(function(a, b){return b-a});
            events_data = {
              "events": parentEvents,
              "years": years
            };
          }
        })
      }
    });
  } catch (e) {
    console.log('exception thrown by mongo.connect', e);
  }
}

let updateRaEvent = (year, code) => {
  let evt = year + code;
  console.log(evt);

  console.log(evt + ': requesting to start update')

  // if (false) {
  if (evt in jobs) {
      return({
        'year': year, 
        'code': code, 
        'jobid': jobs[evt]
      });
    console.log(evt + ': job already exists: ' + jobs[evt])
  } else {
    // send the request to start the job for scrapyd
    request.post(
      'http://localhost:6800/schedule.json',
      { form: { 
        project: 'timecontrol', 
        spider: 'ra_scores',
        year: year,
        event_code: code,
      } },
      function (err, response, data) {
        if (!err && response.statusCode == 200) {
          data = JSON.parse(data)
          jobs[evt] = data.jobid
          return({year: year, code: code, 'jobid': data.jobid})
          console.log(evt + ': starting the update: ' + jobs[evt])
        } else {
          return({error: err})
        }
      }
    );
  }
}

app.get("/api/events", (req, res) => {
  if (!events_data) {
    updateEventsData();
  }
  res.send(events_data);
});

app.get('/api/ra/:year/:code', function(req, res, next) {
  try {
    var year = req.params.year
    var code = req.params.code

    mongo.connect(mongo_url, function(err, db) {
      if (err) {
        res.send({error: err});
        console.log('Unable to connect to database server', err)
      } else {
        var collection = db.collection('ra_scores')
        collection.findOne({
          'year':year,
          'event_code':code
        }, function(err, data) {
          if (err) {
            res.send({error: err});
          } else if (data) {
            res.send(data);
          } else {
            res.send({no_data: 'There is no data for this event, please update.'});
          }
        });
      }
    });
  } catch(e) {
    next(e)
  }
});

var jobs = {};

app.get('/api/ra/update/:year/:code', function(req, res, next) {
  var year = req.params.year
  var code = req.params.code
  res.send(updateRaEvent(year,code));
});

var latestStatus = {};
var waitingClients = [];
var checkStatus = function() {
  let srvSockets = io.sockets.sockets;
  if (Object.keys(srvSockets).length > 0) {
    request.get(
      'http://localhost:6800/listjobs.json?project=timecontrol',
      function (err, response, data) {
        if (!err && response.statusCode == 200) {
          data = JSON.parse(data);
          latestStatus = data;
        } else {
          console.log(err)
        }
      }
    );
  }

  const findInFinshed = (id, status) => {
    for (let i in status.finished) {
      if (id === status.finished[i].id) {
        return true;
      }
    }
    return false;
  }
  let finishedJobs = [];
  for (let evt in jobs) {
    if (jobs.hasOwnProperty(evt)) {
      let jobid = jobs[evt];
      if (latestStatus.finished && findInFinshed(jobid, latestStatus)) {
        finishedJobs.push(evt);
        console.log(evt);
      }
    }
  }
  for (let i in finishedJobs) {
    let evt = finishedJobs[i];
    console.log(evt + ': finished, removing from jobs');
    delete jobs[evt];
  }
}

// poll the status from scrapyd every 1 seconds
setInterval(checkStatus, 1000);

io.on('connection', function(client) {
  let srvSockets = io.sockets.sockets;
  console.log('number of connected clients: ' + Object.keys(srvSockets).length);

  client.on('subscribeToStatus', (interval) => {
    console.log('client is subscribing to status with interval ', interval);
    setInterval(() => {
      client.emit('status', latestStatus);
    }, interval);
  });
});

server.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

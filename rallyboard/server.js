var express = require('express')
  , logger = require('morgan')
  , request = require('request')
  , app = express()
  , mongodb = require('mongodb')
  , homepage = require('pug').compileFile(__dirname + '/source/templates/homepage.pug')
  , ra = require('pug').compileFile(__dirname + '/source/templates/ra.pug')
  , MongoClient = mongodb.MongoClient
  , mongodb_url = 'mongodb://localhost:27017/rally'
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.set('port', process.env.PORT || 80)

var is_live = function(event) {
  var today = new Date()
  var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  if ("start" in event) {
    if(event.start >= today) {
      var end = event.start
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

app.get('/', function (req, res, next) {
  try {
    MongoClient.connect(mongodb_url, function(err, db) {
      if (err) {
        console.log('Unable to connect to database server', err)
      } else {
        var collection = db.collection('ra_events')
        collection.find({},{'sort' : ['start', 'descending']}).toArray(function(err, data) {
          if (err) {
            res.send(err)
          } else if (data) {
            var parentEvents = {};
            var years = new Set();
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
            res.send(homepage({
              "events": parentEvents,
              "years": years
            }))
          }
        })
      }
    })
  } catch(e) {
    next(e)
  }
})

app.get('/ra/:year/:event_code', function(req, res, next) {
  try {
    var year = req.params.year
    var event_code = req.params.event_code

    MongoClient.connect(mongodb_url, function(err, db) {
      if (err) {
        console.log('Unable to connect to database server', err)
      } else {
        var collection = db.collection('ra_scores')
        collection.findOne({
          'year':year,
          'event_code':event_code
        }, function(err, data) {
          if (err) {
            res.send(err)
          } else if (data) {

            res.send(ra({
              data: data
            }))
          } else {
            res.send(ra({
              data:{'year': year, 
              'event_code': event_code}
            }))
          }
        })
      }
    })
  } catch(e) {
    next(e)
  }
})

var jobs = {}
var viewing = {}

var get_status = function(jobid, status) {
  if (status.status !== "ok") {
    return status.status
  }

  for (var i in status.running) {
    if (jobid === status.running[i].id) {
      return "running"
    }
  }

  for (var i in status.finished) {
    if (jobid === status.finished[i].id) {
      return "finished"
    }
  }

  for (var i in status.pending) {
    if (jobid === status.pending[i].id) {
      return "pending"
    }
  }

  return "unknown"
}

var waitingClients = 0;
var checkStatus = function() {
  if (waitingClients > 0) {
    request.get(
      'http://localhost:6800/listjobs.json?project=timecontrol',
      function (err, response, data) {
        if (!err && response.statusCode == 200) {
          io.emit('status', data);
        } else {
          console.log(err)
          res.send(err);
        }
      }
    );
  }
}

var updateLive = function() {
  for (var id in viewing) {
    // check if any of these are live events, if so update them every 10 minutes people are looking at them
    var updating = []
    if (viewing[id].is_live && !(viewing[id] in updating)) {
      // send the request to start the job for scrapyd
      request.post(
        'http://localhost:6800/schedule.json',
        { form: { 
          project: 'timecontrol', 
          spider: 'ra_scores',
          year: viewing[id].year,
          event_code: viewing[id].event_code,
        } },
        function (err, response, data) {
          if (!err && response.statusCode == 200) {
            console.log('updating: ' + viewing[id].year + ' ' + viewing[id].event_code)
            io.emit('refresh', viewing[id])
            updating.push(viewing[id]) // don't do this for every person that is watching
          } else {
            console.log(err)
            io.emit('error', err);
          }
        }
      );
    }
  }
}
// poll the status from scrapyd every 3 seconds
setInterval(checkStatus, 3000);
// update live events every 5 minutes
setInterval(updateLive, 60000*5);

io.on('connection', function(client) {
  waitingClients += 1;
  console.log('connection waitingClients: ', waitingClients);

  client.on('disconnect', function() {
    waitingClients -= 1;
    console.log('disconnect waitingClients: ', waitingClients);
    if (client.id in viewing) {
      delete viewing[client.id]
    }
  });

  client.on('viewing', function(msg) {
    var first = true
    for (var id in viewing) {
      if (msg === viewing[id]) {
        first = false
      }
    }
    viewing[client.id] = msg
    if (first) {
      updateLive()
    }
  })

  client.on('finished', function(msg) {
    if (msg in jobs) {
      delete jobs[msg]
    }
  })

  client.on('crawl', function(msg) {
    console.log('received crawl')
    console.log(msg)

    if (msg in jobs) {
      io.emit('crawling', {
        'year': msg.year, 
        'event_code': msg.event_code, 
        'jobid': jobs[msg]
      })
    } else {

      // send the request to start the job for scrapyd
      request.post(
        'http://localhost:6800/schedule.json',
        { form: { 
          project: 'timecontrol', 
          spider: 'ra_scores',
          year: msg.year,
          event_code: msg.event_code,
        } },
        function (err, response, data) {
          if (!err && response.statusCode == 200) {
            data = JSON.parse(data)
            jobs[msg] = data.jobid
            io.emit('crawling', {
              'year': msg.year, 
              'event_code': msg.event_code, 
              'jobid': data.jobid
            })
          } else {
            console.log(err)
            io.emit('error', err);
          }
        }
      );
    }
  })
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

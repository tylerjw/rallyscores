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

app.get('/', function (req, res, next) {
  try {
    MongoClient.connect(mongodb_url, function(err, db) {
      if (err) {
        console.log('Unable to connect to database server', err)
      } else {
        console.log('Connection to database established')
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

    console.log(year)
    console.log(event_code)

    MongoClient.connect(mongodb_url, function(err, db) {
      if (err) {
        console.log('Unable to connect to database server', err)
      } else {
        console.log('Connection to database established')
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
            // send the request to start the job for scrapyd
            request.post(
              'http://localhost:6800/schedule.json',
              { form: { 
                project: 'timecontrol', 
                spider: 'ra_scores',
                year: year,
                event_code: event_code,
              } },
              function (err, response, data) {
                if (!err && response.statusCode == 200) {
                  data = JSON.parse(data)
                  res.send(ra({
                    data:{'year': year, 'event_code': event_code, 'jobid': data.jobid}
                  }))
                } else {
                  console.log(err)
                  res.send(err);
                }
              }
            );
          }
        })
      }
    })
  } catch(e) {
    next(e)
  }
})

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
// poll the status from scrapyd every 2 seconds
setInterval(checkStatus, 3000);

io.on('connection', function(client) {
  waitingClients += 1;
  console.log('connection waitingClients: ', waitingClients);

  client.on('disconnect', function() {
    waitingClients -= 1;
    console.log('disconnect waitingClients: ', waitingClients);
  });
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

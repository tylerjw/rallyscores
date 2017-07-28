var express = require('express')
  , logger = require('morgan')
  , app = express()
  , mongodb = require('mongodb')
  , homepage = require('pug').compileFile(__dirname + '/source/templates/homepage.pug')
  , ra = require('pug').compileFile(__dirname + '/source/templates/ra.pug')
  , MongoClient = mongodb.MongoClient
  , mongodb_url = 'mongodb://localhost:27017/rally'

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))

app.get('/', function (req, res, next) {
  try {
    MongoClient.connect(mongodb_url, function(err, db) {
      if (err) {
        console.log('Unable to connect to database server', err)
      } else {
        console.log('Connection to database established')
        var collection = db.collection('ra_events')
        collection.find({'type':'parent'}).toArray(function(err, data) {
          if (err) {
            res.send(err)
          } else if (data) {
            var dataTree = {};
            var years = new Set();
            for (let event of data) {
              if (event.year in dataTree) {
                dataTree[event.year].push(event)
              } else {
                dataTree[event.year] = [event]
              }
              years.add(event.year)
            }
            years = Array.from(years).sort(function(a, b){return b-a});
            res.send(homepage({
              "dataTree": dataTree,
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
        var collection = db.collection('rallyamerica')
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
          }
        })
      }
    })
  } catch(e) {
    next(e)
  }
})

app.listen(process.env.PORT || 80, function() {
  console.log('Listening on http://localhost:' + (process.env.PORT || 80))
})

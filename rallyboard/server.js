var express = require('express')
  , logger = require('morgan')
  , app = express()
  , mongodb = require('mongodb')
  , homepage = require('pug').compileFile(__dirname + '/source/templates/homepage.pug')
  , ra = require('pug').compileFile(__dirname + '/source/templates/ra.pug')

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))

app.get('/', function (req, res, next) {
  try {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log('Unable to connect to database server', err)
      } else {
        console.log('Connection to database established')
        var collection = db.collection('rallyamerica')
        collection.find({}, function(err, data) {
          if (err) {
            res.send(err)
          } else if (data) {
            res.send(homepage({
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

app.get('/ra/:year/:event_code', function(req, res, next) {
  try {
    var year = req.params.year
    var event_code = req.params.event_code
    var MongoClient = mongodb.MongoClient
    var url = 'mongodb://localhost:27017/rally'

    console.log(year)
    console.log(event_code)

    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log('Unable to connect to database server', err)
      } else {
        console.log('Connection to database established')
        var collection = db.collection('ra_events')
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

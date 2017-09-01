const express = require('express');
const mongodb = require('mongodb')

const app = express();
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
            res.send({error: "No results found, please check back later."});
          }
        })
      }
    })
  } catch(e) {
    next(e)
  }
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

"use strict";

import path from 'path';
import http from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import NotFoundPage from './components/NotFoundPage';
import SocketIO from 'socket.io';
import { MongoClient } from 'mongodb';

// Initalize the server and configure support for ejs templates
const app = new Express();
const server = new http.Server(app);
const io = new SocketIO(server);
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'production';
const mongo_url = 'mongodb://localhost:27017/rally'
const mongo = MongoClient()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// devind the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));

let updateEventsData = () => {
  try {
    mongo.connect(mongo_url, (err, db) => {
      if (err) {
        console.log('Unable to connect to database server', err);
      } else {
        let collection = db.collection('ra_events');
        let results = collection.find({},{'sort': ['start':'decending']});
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

// events data for main page
let events_data;
app.get('/events.json', (req, res) => {
  if (!events_data) {
    console.log('updating events data')
    updateEventsData();
  }
  res.send(events_data);
});

// universal routing and rendering
app.get('*', (req, res) => {
  match(
    { routes, location: req.url },
    (err, redirectLocation, renderProps) => {

      // in case of error display the error message
      if (err) {
        return res.status(500).send(err.message);
      }

      // in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      // generate the React markup for the current route
      let markup;
      if (renderProps) {
        // if the current route matched we have renderProps
        markup = renderToString(<RouterContext {...renderProps}/>);
      } else {
        // otherwise we can render a 404 page
        markup = renderToString(<NotFoundPage/>);
        res.status(404);
      }

      // render the index template with the embedded react markup
      return res.render('index', { markup });
    }
  );
});


// socket io
let sockets = {};

io.on('connection', (socket) => {
  console.log('socket connected');
  sockets[socket.id] = socket;

  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });
});

// start the server
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});

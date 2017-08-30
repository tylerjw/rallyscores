"use strict";

import React from 'react';

export default class EventSelector extends React.Component {
  getDate(event) {
    let date = 'unknown date'
    if (event.start) {
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      date = monthNames[event.start.getMonth()] + ' ' + event.start.getDate()
      if(event.end) { date += ' - ' + event.end.getDate(); }
      date += ', ' + event.start.getFullYear()
    }
    return date;
  }

  render() {
    return (
      <div className="event-selector">
        {this.props.data.years.map(year => {
          return( 
            <div className={`${year}-events`}>
              <h1>{year} Events</h1>
              <ul>
                {this.props.data.events.year.map(event => {
                  return(
                    <li>
                      <Link key={`ra-${year}-${event.event_code}`} to={`/ra/${year}/${event.event_code}`} activeClassName="active">
                        {event.name}
                      </Link>
                      - code: {event.code} - {getDate(event)}
                    </li>
                  );
                })}
              </ul>
              <br/>
            </div>
          );
        })}
      </div>
    );
  }
}

import React, { Component } from "react";
import { Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class EventCards extends Component {

  prettyDates(event) {
    const monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    let start = new Date(event.start);
    let date = monthNames[start.getMonth()] + ' ' + start.getDate();
    if(event.end) { 
      let end = new Date(event.end);
      date += ' - ' + end.getDate(); 
    }
    date += ', ' + start.getFullYear();

    return date;
  }

  render() {
    const { events } = this.props;
    const eventCompare = (a,b) => {
      a = new Date(a.start);
      b = new Date(b.start);
      return a<b ? -1 : a>b ? 1 : 0;
    }
    let items = []

    if (events) {
      items = events.sort(eventCompare).map((event, index) => (
        {
          header: event.name,
          description: event.town,
          meta: this.prettyDates(event),
          as: Link,
          to: '/ra/' + event.year + '/' + event.event_code
        }
      ));
    }

    return (
      <Card.Group items={items} itemsPerRow={2} stackable/>
    );
  }
}

export default EventCards;

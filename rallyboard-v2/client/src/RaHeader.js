import React, { Component } from 'react';
import { 
  Divider, 
  Header
} from 'semantic-ui-react';

class RaHeader extends Component {

  render() {
    const { data } = this.props;
    const monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    let start = new Date(data.start);
    let dates = monthNames[start.getMonth()] + ' ' + start.getDate();
    if(data.end) { 
      let end = new Date(data.end);
      dates += ' - ' + end.getDate(); 
    }
    dates += ', ' + start.getFullYear();

    return (
      <div>
        <Divider/>
        <Header as='h2'>
          {data.event_name} {data.year}
          <Header.Subheader>
            {data.town}
            <br/>
            {dates}
            <br/>
            {data.event_type}
          </Header.Subheader>
        </Header>
      </div>
    );
  }
}

export default RaHeader;

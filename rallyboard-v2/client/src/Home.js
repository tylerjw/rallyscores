import React, { Component } from "react";
import EventMenu from './EventMenu';
import { Message, Container, Segment, Header } from 'semantic-ui-react';

class Home extends Component {
  render() {
    return (
      <div id="home">
        <Segment id="segment" vertical>
          <Container text>
            <Header as="h3" style={{ fontSize: '2em' }}>Welcome to our new site!</Header>
            <p>
              All scoring data is gathered from <a href="www.rally-america.com">Rally America's website.  </a> 
              There are no guarantees of accuracy.  Inspiration for this was taken from the 
              <a href="http://www.daronhume.com/rally/combine.php5?new_rally=1&rally_id=colo&rally_year=2017">
              Rally America Combiner Thing</a>.  This site caches results in a seprate database to provide you fast 
              page loads and to reduce the load on RA's site.
            </p>
            <Message error>Some events do not have avalible results because rally-america.com went down before
            we were able to cache all the event results.  We will fix this after their website is restored.</Message>
          </Container>
        </Segment>
        <EventMenu />
      </div>
    );
  }
}

export default Home;

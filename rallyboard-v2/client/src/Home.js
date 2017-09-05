import React, { Component } from "react";
import EventMenu from './EventMenu';
import { Container, Segment, Header } from 'semantic-ui-react';

class Home extends Component {
  render() {
    const rallyCombinerLink = "http://www.daronhume.com/rally/combine.php5?new_rally=1&rally_id=colo&rally_year=2017";
    const raLink = "http://www.rally-america.com";

    return (
      <div id="home">
        <Segment id="segment" vertical>
          <Container text>
            <Header as="h3" style={{ fontSize: '2em' }}>Welcome to our new site!</Header>
            <p>
              All scoring data is gathered from <a href={raLink}>Rally America's website.  </a> 
              There are no guarantees of accuracy.  Inspiration for this was taken from the <a href={rallyCombinerLink}>
              Rally America Combiner Thing</a>.  This site caches results in a seprate database to provide you fast 
              page loads and to reduce the load on RA's site.
            </p>
          </Container>
        </Segment>
        <EventMenu />
      </div>
    );
  }
}

export default Home;

import React, { Component } from "react";
import { getEvents } from "./Client";
import { 
  Dropdown, 
  Container, 
  Segment, 
  Header,
  Dimmer,
  Loader } from 'semantic-ui-react';
import EventCards from './EventCards';

class EventMenu extends Component {
  state = {
    events: [],
    years: [],
    activeYear: '',
    loaded: false
  }

  constructor(props) {
    super(props);
    getEvents(data => {
      this.setState({
        events: data.events,
        years: data.years,
        activeYear: data.years[0],
        loaded: true
      })
    })
  }

  render() {
    let options = this.state.years.map(year => {
      return {
        key: year,
        text: year,
        value: year
      }
    });

    if (this.state.loaded) {
      return (
        <Segment id="segment" vertical>
          <Container>
            <Header as="h3" style={{ fontSize: '2em' }}>{this.state.activeYear} Events</Header>
            <Dropdown options={options} fluid search selection
              onChange={(e, { value }) => { this.setState({activeYear: value}); }}
              placeholder='Year'/>
          </Container>
          <Container style={{ padding: '2em 0em' }}>
            <EventCards events={this.state.events[this.state.activeYear]}/>
          </Container>
        </Segment>
      );
    } else {
      return (
        <Dimmer active inverted>
          <Loader size="large">Loading Data</Loader>
        </Dimmer>
      );
    }
  }
}

export default EventMenu;

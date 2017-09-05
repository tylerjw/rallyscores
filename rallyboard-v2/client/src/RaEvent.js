import React, { Component } from 'react';
import RaHeader from './RaHeader';
import RaTableMenu from './RaTableMenu';
import RaBreadcrumb from './RaBreadcrumb';
import LoadingStatus from './LoadingStatus';
import { getRaEvent, updateRaEvent, subscribeToStatus, getJobStatus } from './Client';
import {
  Dimmer,
  Loader,
  Button,
  Segment,
  Container,
  Message
} from 'semantic-ui-react';

class RaEvent extends Component {
  state = {
    data: {},
    loaded: false,
    error: false,
    jobid: false,
    status: false
  }

  constructor(props) {
    super(props);
    const { year, code } = this.props.match.params;
    getRaEvent(year, code, data => {
      this.setState({
        data: data,
        loaded: true
      });
      if ('no_data' in data) {
        this.updateEvent();
      }

    });

    // bind my methods
    this.updateEvent = this.updateEvent.bind(this);
  }

  updateEvent() {
    const { year, code } = this.props.match.params;
    this.setState({status: 'started'});
    updateRaEvent(year, code, data => {
      if ('error' in data) {
        this.setState({error: data.error});
      } else {
        subscribeToStatus((err, fullStatus) => {
          let status = getJobStatus(data.jobid, fullStatus);
          this.setState({status:status});
        });
        this.setState({jobid: data.jobid});
      }
    });
  }

  render() {
    const { year, code } = this.props.match.params;
    let { jobid, data, loaded, status } = this.state;

    if (jobid && status === 'finished') {
      jobid = false;
      getRaEvent(year, code, data => {
        this.setState({
          data: data,
          status: false
        });
      });
    }

    const loadingDimmer = (
      <Dimmer active inverted>
        <Loader size="large">Requesting Data</Loader>
      </Dimmer>
    );
    let ret = loadingDimmer;

    let is_error = (data.error) ? true  : false;
    let error = (is_error) ? data.error : false;

    let is_header_data = 'num_stages' in data;
    let is_data = data.num_stages > 0;
    let no_data = !is_data;

    let start = new Date(data.start);
    let now = new Date();

    let in_future = start > now;
    if (in_future) {
      error = 'This event is in the future.  Please come back later when results are posted.'
    }

    if (!error && !in_future && no_data) {
      error = 'There is no data yet for this event in our database. Please update the data if scores are available.';
    }

    let show_update_button = (!in_future && !status);

    if (loaded) {
      ret = (
        <div id="ra-event">
          <Segment>
            <Container text>
              <RaBreadcrumb year={year} code={code}/>
              {show_update_button && <Button onClick={this.updateEvent} floated='right'>Update Event Data</Button>}
              {is_header_data && <RaHeader data={data}/>}
              {is_error && <Message error header='Error' content={error} /> }
              {status && <LoadingStatus status={status}/>}
            </Container>
          </Segment>
          {is_data && <RaTableMenu data={data}/>}
        </div>
      );
    } 
    return ret;
  }
}

export default RaEvent;

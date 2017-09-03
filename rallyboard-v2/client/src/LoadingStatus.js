import React, { Component } from 'react';
import {
  Progress,
  Segment,
  Header
} from 'semantic-ui-react';

class LoadingStatus extends Component {
  render() {
    const { status } = this.props;
    let percent = 0;

    if (status === 'started') {
      percent = 25;
    } else if (status === 'pending') {
      percent = 50;
    } else if (status === 'running') {
      percent = 75;
    } else if (status === 'finished') {
      percent = 100;
    }

    return (
      <Segment>
        <Header>Updating results</Header>
        <Progress percent={percent} indicating > Job status: {status} </Progress>
      </Segment>
    );
  }
}

export default LoadingStatus;

import React, { Component } from 'react';
import RaHeader from './RaHeader';
import RaTableMenu from './RaTableMenu';
import RaBreadcrumb from './RaBreadcrumb'
import { getRaEvent } from './Client';
import {
  Dimmer,
  Loader
} from 'semantic-ui-react';

class RaEvent extends Component {
  state = {
    data: {},
    loaded: false
  }

  constructor(props) {
    super(props);
    const { year, code } = this.props.match.params;
    getRaEvent(year, code, data => {
      this.setState({
        data: data,
        loaded: true
      })
    })
  }

  render() {
    const { year, code } = this.props.match.params;
    let { data, loaded } = this.state;

    if (loaded) {
      return (
        <div id="ra-event">
          <RaBreadcrumb year={year} code={code}/>
          <RaHeader data={data}/>
          <RaTableMenu data={data}/>
        </div>
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

export default RaEvent;

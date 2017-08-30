import React, { Component } from 'react';
import RaHeader from './RaHeader';
import RaTableMenu from './RaTableMenu';
import RaBreadcrumb from './RaBreadcrumb'
import { getRaEvent } from './Client';

class RaEvent extends Component {
  state = {
    data: {}
  }

  constructor(props) {
    super(props);
    const { year, code } = this.props.match.params;
    getRaEvent(year, code, data => {
      this.setState({
        data: data
      })
    })
  }

  render() {
    const { year, code } = this.props.match.params;
    let { data } = this.state;

    return (
      <div id="ra-event">
        <RaBreadcrumb year={year} code={code}/>
        <RaHeader data={data}/>
        <RaTableMenu data={data}/>
      </div>
    );
  }
}

export default RaEvent;

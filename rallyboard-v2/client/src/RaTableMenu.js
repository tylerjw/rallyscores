import React, { Component } from 'react';
import { 
  Container,
  Menu,
  Dropdown
} from 'semantic-ui-react';
import RaTable from './RaTable'

class RaTableMenu extends Component {
  state = {
    standing: true
  }

  render() {
    const { data } = this.props;
    const handleMenuClick = (e, { name }) => {
      this.setState({
        standing: (name === 'Standings')
      });
    };

    const menuItems = [
      { key: 'standing', 
        active: (this.state.standing), 
        name: 'Standings',
        onClick: handleMenuClick
      },
      { key: 'results', 
        active: !(this.state.standing), 
        name: 'Stage Results',
        onClick: handleMenuClick
      }
    ];

    var stages = [];
    for (var i = data.num_stages; i > 0; i--) {
      var location = data['stage_times'][i.toString()]['location'];
      stages.push({
        key: i,
        text: 'Stage ' + i + ' - ' + location,
        value: i
      })
    }

    let curr_stage = data.num_stages;
    if ('activeStage' in this.state) {
      curr_stage = this.state.activeStage;
    }

    return (
      <Container>
        <Dropdown options={stages} fluid selection onChange={(e, { value }) => {
          this.setState({
            activeStage: value
          })
        }} defaultValue={data.num_stages} 
        placeholder="Select Stage"/>
        <Menu items={menuItems} widths='2' inverted attached='top'/>
        <RaTable standing={this.state.standing} data={data} stage={curr_stage}/>
      </Container>
    );
  } 
}

export default RaTableMenu;

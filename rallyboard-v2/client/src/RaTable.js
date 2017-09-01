import React, { Component } from 'react';
import {
  Table
} from 'semantic-ui-react';

class RaTable extends Component {
  render() {
    const standing_header = (table_key) => {
      return (
      <Table.Header>
        <Table.Row key={table_key}>
          <Table.HeaderCell key={table_key+'Pos'}>Pos</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'#'}>#</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Cl'}>Cl</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'CP'}>CP</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Driver'}>Driver / Codriver</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Time'}>Time</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Back'}>Back</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Gap'}>Gap</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Penalties'}>Penalties</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      );
    };
    const standing_row = (standing, index) => {
      let row_key = stage+'standing'+index;
      return (
        <Table.Row key={row_key}>
          <Table.Cell key={row_key+'position'}>{standing.position}</Table.Cell>
          <Table.Cell key={row_key+'car_number'}>{standing.car_number}</Table.Cell>
          <Table.Cell key={row_key+'car_class'}>{standing.car_class}</Table.Cell>
          <Table.Cell key={row_key+'position_in_class'}>{standing.position_in_class}</Table.Cell>
          <Table.Cell key={row_key+'driver'}>{standing.driver} / {standing.codriver}</Table.Cell>
          <Table.Cell key={row_key+'total_time'}>{standing.total_time}</Table.Cell>
          <Table.Cell key={row_key+'diff_leader'}>{standing.diff_leader}</Table.Cell>
          <Table.Cell key={row_key+'diff_previous'}>{standing.diff_previous}</Table.Cell>
          <Table.Cell key={row_key+'total_penalty_time'}>{standing.total_penalty_time}</Table.Cell>
        </Table.Row>
      );
    };

    const stage_header = (table_key) => {
      return (
      <Table.Header>
        <Table.Row key={table_key}>
          <Table.HeaderCell key={table_key+'Pos'}>Pos</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'#'}>#</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Cl'}>Cl</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'CP'}>CP</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Driver'}>Driver / Codriver</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Time'}>Time</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Back'}>Back</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Avg MPH'}>Avg MPH</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      );
    };
    const stage_row = (stage, index) => {
      let row_key = stage+'stage'+index;
      return (
        <Table.Row key={row_key}>
          <Table.Cell key={row_key+'position'}>{stage.position}</Table.Cell>
          <Table.Cell key={row_key+'car_number'}>{stage.car_number}</Table.Cell>
          <Table.Cell key={row_key+'car_class'}>{stage.car_class}</Table.Cell>
          <Table.Cell key={row_key+'position_in_class'}>{stage.position_in_class}</Table.Cell>
          <Table.Cell key={row_key+'driver'}>{stage.driver} / {stage.codriver}</Table.Cell>
          { (stage.dnf) && <Table.Cell key={row_key+'dnf'} colSpan='3'>DNF</Table.Cell> }
          { !(stage.dnf) && <Table.Cell key={row_key+'total_time'}>{stage.total_time}</Table.Cell> }
          { !(stage.dnf) && <Table.Cell key={row_key+'diff_leader'}>{stage.diff_leader}</Table.Cell> }
          { !(stage.dnf) && <Table.Cell key={row_key+'avg_mph'}>{stage.avg_mph}</Table.Cell> }
        </Table.Row>
      );
    };
    
    const { data, standing, stage } = this.props;

    if (standing) {
      var stage_standings  = data['stage_standings'][stage]['scores'];
      let standings_body = stage_standings.map(standing_row);
      return (
        <Table celled compact unstackable>
          {standing_header(stage+'standing')}
          <Table.Body>
            {standings_body}
          </Table.Body>
        </Table>
      );
    } else {
      var stage_times  = data['stage_times'][stage]['scores'];
      let stage_body = stage_times.map(stage_row);
      return (
        <Table celled compact unstackable>
          {stage_header(stage+'stage')}
          <Table.Body>
            {stage_body}
          </Table.Body>
        </Table>
      );
    }
  }
}

export default RaTable;

import React, { Component } from 'react';
import {
  Table,
  Popup,
  Modal,
  Header,
  Icon
} from 'semantic-ui-react';

class RaTable extends Component {
  render() {
    let delta_icon = (delta) => {
      if (delta > 0) {
        return (<Icon name='long arrow up' color='green'>{delta}</Icon>);
      }
      if (delta < 0) {
        return (<Icon name='long arrow down' color='red'>{delta*-1}</Icon>);
      }
      return '';
    }

    let standing_header = (table_key) => {
      return (
      <Table.Row key={table_key}>
        <Table.HeaderCell key={table_key+'Pos'}>Pos</Table.HeaderCell>
        <Table.HeaderCell key={table_key+'#'}>#</Table.HeaderCell>
        <Table.HeaderCell key={table_key+'Class'}>Class</Table.HeaderCell>
        <Popup trigger={
          <Table.HeaderCell key={table_key+'CP'}>CP</Table.HeaderCell>
        } content="Class position" />
        <Table.HeaderCell key={table_key+'Driver'}>Driver / Codriver</Table.HeaderCell>
        <Table.HeaderCell key={table_key+'Time'}>Time</Table.HeaderCell>
        <Table.HeaderCell key={table_key+'Back'}>Back</Table.HeaderCell>
        <Table.HeaderCell key={table_key+'Gap'}>Gap</Table.HeaderCell>
        <Table.HeaderCell key={table_key+'Penalties'}>Penalties</Table.HeaderCell>
      </Table.Row>
      );
    };
    let standing_row = (standing, index) => {
      let row_key = stage+'standing'+index;

      let penaltyRow = (data, index) => {
        let p_row_key = row_key+'penalty'+index;
        return (
          <Table.Row key={p_row_key}>
            <Table.Cell key={p_row_key+'penalty'}>{data[0]}</Table.Cell>
            <Table.Cell key={p_row_key+'time'} textAlign='right'>{data[1]}</Table.Cell>
          </Table.Row>
        );
      }

      let penaltyCell = (penalties) => {
        if (penalties.length) {
          return (
            <Modal closeIcon trigger={
              <Table.Cell key={row_key+'total_penalty_time'} negative>{standing.total_penalty_time}</Table.Cell>
            }> 
              <Header>
                <Icon name='frown' size='big'/>
                Penalties awarded to #{standing.car_number} ({standing.driver} / {standing.codriver})
              </Header>
              <Modal.Content>
                <Table 
                  striped 
                  tableData={penalties} 
                  renderBodyRow={penaltyRow} 
                  footerRow={
                    <Table.Row key={row_key+'total_penalty_time_row'} negative>
                      <Table.Cell>TOTAL</Table.Cell>
                      <Table.Cell key={row_key+'total_penalty_time_footer'} textAlign='right'>{standing.total_penalty_time}</Table.Cell>
                    </Table.Row>
                  }/>
              </Modal.Content>
            </Modal>
          );
        } else {
          return (<Table.Cell key={row_key+'total_penalty_time'}>{standing.total_penalty_time}</Table.Cell>);
        }
      }

      return (
        <Table.Row key={row_key}>
          <Table.Cell key={row_key+'position'}>
            {standing.position} {delta_icon(standing.position_delta)}
          </Table.Cell>
          <Table.Cell key={row_key+'car_number'}>{standing.car_number}</Table.Cell>
          <Table.Cell key={row_key+'car_class'}>{standing.car_class}</Table.Cell>
          <Table.Cell key={row_key+'position_in_class'}>
            {standing.position_in_class} {delta_icon(standing.position_in_class_delta)}
          </Table.Cell>
          <Table.Cell key={row_key+'driver'}>{standing.driver} / {standing.codriver}</Table.Cell>
          <Table.Cell key={row_key+'total_time'}>{standing.total_time}</Table.Cell>
          <Table.Cell key={row_key+'diff_leader'}>{standing.diff_leader}</Table.Cell>
          <Table.Cell key={row_key+'diff_previous'}>{standing.diff_previous}</Table.Cell>
          {penaltyCell(standing.penalties)}
        </Table.Row>
      );
    };

    let stage_header = (table_key) => {
      return (
        <Table.Row key={table_key}>
          <Table.HeaderCell key={table_key+'Pos'}>Pos</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'#'}>#</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Class'}>Class</Table.HeaderCell>
          <Popup trigger={
            <Table.HeaderCell key={table_key+'CP'}>CP</Table.HeaderCell>
          } content="Class position" />
          <Table.HeaderCell key={table_key+'Driver'}>Driver / Codriver</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Time'}>Time</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Back'}>Back</Table.HeaderCell>
          <Table.HeaderCell key={table_key+'Avg MPH'}>Avg MPH</Table.HeaderCell>
        </Table.Row>
      );
    };
    let stage_row = (stage, index) => {
      let row_key = stage+'stage'+index;
      return (
        <Table.Row key={row_key}>
          <Table.Cell key={row_key+'position'}>
            {stage.position} {delta_icon(stage.position_delta)}
          </Table.Cell>
          <Table.Cell key={row_key+'car_number'}>{stage.car_number}</Table.Cell>
          <Table.Cell key={row_key+'car_class'}>{stage.car_class}</Table.Cell>
          <Table.Cell key={row_key+'position_in_class'}>
            {stage.position_in_class} {delta_icon(stage.position_in_class_delta)}
          </Table.Cell>
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
      return (
        <Table 
          compact 
          striped
          unstackable
          tableData={data['stage_standings'][stage]['scores']}
          renderBodyRow={standing_row}
          headerRow={standing_header(stage+'standing')}
          />
      );
    } else {
      return (
        <Table 
          compact 
          striped
          unstackable
          tableData={data['stage_times'][stage]['scores']}
          renderBodyRow={stage_row}
          headerRow={stage_header(stage+'stage')} 
          />
      );
    }
  }
}

export default RaTable;

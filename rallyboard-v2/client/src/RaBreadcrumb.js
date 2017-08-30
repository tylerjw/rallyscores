import React, { Component } from 'react';
import { 
  Breadcrumb, 
  Segment, 
  Container, 
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class RaBreadcrumb extends Component {

  render() {
    const { year, code } = this.props;

    return (
      <Segment vertical>
        <Container text>
          <Breadcrumb size='big'>
            <Breadcrumb.Section link as={Link} to="/">Home</Breadcrumb.Section>
            <Breadcrumb.Divider icon='right chevron' />
            <Breadcrumb.Section active>Rally America - {year} {code}</Breadcrumb.Section>
          </Breadcrumb>
        </Container>
      </Segment>
    );
  }
}

export default RaBreadcrumb;

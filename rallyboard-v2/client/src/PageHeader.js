import React, { Component } from "react";
import { Container, Segment, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class PageHeader extends Component {
  render() {
    return (
      <Segment id="page-header" textAlign="center" 
        style={{minHeight: 500}} vertical>
        <Container>
          <Link to="/">
            <Header
              as='h1'
              content="Rally Scores"
              style={{ fontSize: '4em', fontWeight: 'normal', marginBottom: 0, marginTop: '.5em'}}/>
          </Link>
        </Container>
      </Segment>
    );
  }
}

export default PageHeader;

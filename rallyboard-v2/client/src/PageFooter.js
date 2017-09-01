import React, { Component } from 'react';
import {
  Segment,
  Container,
  Grid,
  List,
  Header
} from 'semantic-ui-react';

class PageFooter extends Component {
  render() {
    return (
      <Segment inverted vertical style={{ padding: '5em 0em' }}>
        <Container>
          <Grid divided inverted stackable>
            <Grid.Row>
              <Grid.Column width={3}>
                <Header inverted as='h4' content='Contact' />
                <List link inverted>
                  <List.Item as='a' href="mailto:tyler@weaveringrally?Subject=rallyscores.com">Email</List.Item>
                  <List.Item as='a' href="www.weaveringrally.com">Blog</List.Item>
                  <List.Item as='a' href="https://twitter.com/weaveringrally">Twitter</List.Item>
                  <List.Item as='a' href="https://github.com/tylerjw">GitHub</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as='h4' content='Technologies Used' />
                <Grid columns='equal'>
                  <Grid.Column>
                    <List link inverted>
                      <List.Item as='a' href="https://aws.amazon.com">AWS</List.Item>
                      <List.Item as='a' href="https://www.mongodb.com">MongoDB</List.Item>
                      <List.Item as='a' href="https://www.python.org">Python</List.Item>
                      <List.Item as='a' href="https://scrapy.org">Scrapy</List.Item>
                    </List>
                  </Grid.Column>
                  <Grid.Column>
                    <List link inverted>
                      <List.Item as='a' href="https://nodejs.org/en/">NodeJS</List.Item>
                      <List.Item as='a' href="https://facebook.github.io/react/">React</List.Item>
                      <List.Item as='a' href="https://webpack.js.org">Webpack</List.Item>
                      <List.Item as='a' href="https://semantic-ui.com/">Semantic UI</List.Item>
                    </List>
                  </Grid.Column>
                </Grid>
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as='h4' inverted>About</Header>
                <p>This site was created and funded by Tyler Weaver of the Weavering Rally race team.  Remember why we do this and </p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </Segment>
    )
  };
}

export default PageFooter;

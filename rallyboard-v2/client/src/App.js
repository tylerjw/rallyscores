import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import Home from "./Home";
import RaEvent from "./RaEvent";
import PageHeader from "./PageHeader"

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <PageHeader />
          <Route exact path="/" component={Home}/>
          <Route path="/ra/:year/:code" component={RaEvent}/>
        </div>
      </Router>
    );
  }
}

export default App;

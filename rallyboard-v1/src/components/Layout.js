"use strict";

import React from 'react';
import { Link } from 'react-router';

export default class Layout extends React.Component {
  render() {
    return (
      <div className="app-container">
        <header>
          <Link to="/">
            <h1 className="page-title">Rally scores</h1>
          </Link>
        </header>
        <div className="app-content">{this.props.children}</div>
        <footer>
          <p>
            Copyright © 2017 RallyScores. RallyScores® is a Registered Trademark of Bad Man Software (un)Ltd. in the Earth Community and other solar systems.
          </p><br/>
          <p>Blog: <a href="http://weaveringrally.com">weaveringrally.com</a></p>
          <p>Email: <a href="mailto:tyler@weaveringrally?Subject=RallyScores%20Feedback">tyler@weaveringrally</a></p>
          <p>If you find this useful and want to say thank you, you can <a href="http://www.PayPal.Me/LGSSnacks">buy me a coffe</a>.</p>
        </footer>
      </div>
    );
  }
}

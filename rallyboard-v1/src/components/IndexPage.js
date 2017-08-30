"use strict";

import React from 'react';
import EventSelector from './EventSelector';
import { DataGetter } from '../data/data';

export default class IndexPage extends React.Component {
  render() {
    return (
      <div className="home">
        <p>
          All scoring data is gathered from Rally America's website and there are no guarantees of accuracy.  Inspiration for this was taken from the <a href="http://www.daronhume.com/rally/combine.php5?new_rally=1&rally_id=colo&rally_year=2017"> Rally America Combiner Thing</a>.  This site caches times in it's own database to provide you fast page loads and to reduce the load on RA's site.
        </p>
        <EventSelector data={DataGetter().events()}/>
      </div>
    );
  }
}

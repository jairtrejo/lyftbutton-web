import React from "react";

import Lyft from './Lyft.jsx';
import DashButton from './DashButton.jsx';
import Google from './Google.jsx';

export default class App extends React.Component {
  render() {
    return (
      <div className="content">
        <h1>Lyftbutton</h1>
        <Lyft/>
        <DashButton/>
        <Google/>
      </div>
    );
  }
}

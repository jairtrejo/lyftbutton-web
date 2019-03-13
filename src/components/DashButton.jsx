import React from "react";

import { connect, send } from "../flux.js";
import { setupDashButton } from "../sagas.js";
import LocationPicker from './LocationPicker.jsx';
import SerialNumber from './SerialNumber.jsx';

class DashButton extends React.Component {
  onSerialNumberChanged(serialNumber) {
    send('button:serialNumber', serialNumber);
  }

  onHomeLocationPicked = (location) => {
    const home = {
      name: location.name,
      lat: location.position.lat(),
      lng: location.position.lng()
    };

    send('button:home', home);
  }

  onDisconnect = () => {
    send('button:disconnect')
  }

  render() {
    const { dashButton, isLoading } = this.props;

    if (!dashButton && !isLoading) {
      return null;
    }

    const { serialNumber = null, home = null } = dashButton || {};

    let content;

    if (isLoading) {
      content = <p>Loading...</p>
    } else {
      content = (
        <div>
          <SerialNumber serialNumber={serialNumber} onChange={this.onSerialNumberChanged}/>
          {serialNumber && <button onClick={this.onDisconnect}>Disconnect</button>}
          <LocationPicker
            helpText={home ? 'Change home location' : 'Set home location'}
            location={home}
            onSuggestionPicked={this.onHomeLocationPicked}
          />
        </div>
      );
    }

    return (
      <section className="dash-button">
        <h2>Dash button</h2>
        { content }
      </section>
    );
  }
}

export default connect(DashButton, setupDashButton());

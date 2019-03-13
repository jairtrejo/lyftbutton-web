import React from "react";

export default class SerialNumber extends React.Component {
  onChange = (e) => {
    const serialNumber = e.target.value.replace(/\s*/, '');

    if (serialNumber && serialNumber.length === 16) {
      this.props.onChange(serialNumber);
    }
  }

  render() {
    const { serialNumber } = this.props;

    if (serialNumber) {
      return <span>{serialNumber}</span>;
    } else {
      return <label>Serial number: <input type="text" onChange={this.onChange} /></label>;
    }
  }
}

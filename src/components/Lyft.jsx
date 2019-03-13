import React from "react";

import { connect } from '../flux.js';
import { setupLyftAccount } from '../sagas.js';

function Lyft(props) {
  const { lyftAccount, lyftUrl } = props;

  let content;

  if (lyftAccount) {
    content = <span>{`${lyftAccount.firstName}'s account connected`}</span>;
  } else if (lyftUrl) {
    content = <a href={lyftUrl}>Connect with Lyft</a>;
  } else {
    content = 'Loading...';
  }

  return (
    <section className="lyft">
      <h2>Lyft</h2>
      <p>{ content }</p>
    </section>
  );
}

export default connect(Lyft, setupLyftAccount());

import React from "react";

import { setupGoogleAccount } from '../sagas.js';
import { connect, send } from '../flux.js';

function Google(props) {
  const { calendar, url, isLoading = false } = props;

  if (!calendar && !url &!isLoading) {
    return null;
  }

  let content;

  if (url) {
    content = (
      <p>
        <a href={url}>Connect with Google</a>
      </p>
    );
  } else if (isLoading) {
    content = <p>Loading...</p>
  } else {
    content = (
      <p>
        {calendar}
        <button onClick={() => send('google:delete')}>
          Disconnect
        </button>
      </p>
    );
  }

  return (
    <section className="google">
      <h2>Google</h2>
      { content }
    </section>
  );
}

export default connect(Google, setupGoogleAccount());

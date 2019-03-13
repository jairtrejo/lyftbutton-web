import page from 'page';

import api from "./api.js"
import router from './router.js';
import { send, receive, pause, merge } from './flux.js';
import { getSuggestions } from './google.js';

export async function* setupLyftAccount(){
  let query = router.getQuery();

  if (!query) {
    query = await receive('page-loaded');
  }

  const { code, state } = query;

  let lyftAccount;

  if (code && state) {
    try {
      lyftAccount = await api.createLyftAccount(code, state);
    } catch (e) {
      lyftAccount = null;
    }
  }

  if (api.token) {
    try {
      lyftAccount = await api.getLyftAccount();
    } catch (e) {
      lyftAccount = null;
    }
  }

  if (lyftAccount) {
    api.token = lyftAccount.token;
    router.go('/');
    send('authenticated');
    yield { lyftAccount };
  } else {
    const lyftUrl = await api.getLyftUrl();
    yield { lyftUrl };
  }
}

async function* updateDashButton(button) {
  while (true) {
    yield button || {}

    const partialButton = await Promise.race([
      receive('button:serialNumber').then(serialNumber => ({ serialNumber })),
      receive('button:home').then(location => ({ home: location })),
    ]);

    yield { ...button, ...partialButton }
    button = await api.editDashButton(partialButton);
  }
}

async function* deleteDashButton() {
  while(true) {
    await receive('button:disconnect');
    yield {};
    await api.deleteDashButton();
    yield (await api.getDashButton()) || {};
  }
}

export async function* setupDashButton() {
  if (!api.token) {
    await receive('authenticated');
  }

  yield { isLoading: true };
  let button = await api.getDashButton();

  for await (const btn of merge(updateDashButton(button), deleteDashButton())) {
    yield ({ dashButton: btn, isLoading: false });
  }
}

export async function* setupGoogleAccount() {
  if (!api.token) {
    await receive('authenticated');
  }

  let query = router.getQuery();

  if (!query) {
    query = await receive('page-loaded');
  }

  const { code, state } = query;

  let googleAccount;

  yield({isLoading: true});

  if (code && !state) {
    googleAccount = await api.createGoogleAccount(code);
  } else {
    try {
      googleAccount = await api.getGoogleAccount();
    } catch (e) {
      yield {url: e.url};
    }
  }

  if (googleAccount) {
    yield {...googleAccount, isLoading: false};
  }

  await receive('google:delete');
  yield { isLoading: true };
  await api.deleteGoogleAccount(code);

  try {
    await api.getGoogleAccount();
  } catch (e) {
    yield {url: e.url, isLoading: false};
  }
}

export async function* getLocationSuggestions() {
  let timeLeft = 0;
  let query = null;

  while (true) {
    const startTime = (new Date()).getTime();

    const queryUpdate = await Promise.race([
      query ? pause(timeLeft) : (new Promise(Function.prototype)),
      receive('locations:query')
    ]);

    if (queryUpdate) {
      query = queryUpdate;

      const thisTime = (new Date()).getTime();
      const timeElapsed = thisTime - startTime;

      if (timeLeft > 0 && timeElapsed < timeLeft) {
        timeLeft -= timeElapsed;
        continue;
      }
    }

    yield (await getSuggestions(query)).map(
      suggestion => ({
        id: suggestion.id,
        name: suggestion.name,
        position: suggestion.geometry.location
      })
    );
    query = null;
    timeLeft = 1000;
  }
}

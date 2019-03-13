import Cookies from 'js-cookie';

const BASE_URL =
  (process.env.NODE_ENV === 'production') ? 'https://api.lyftbutton.com' : process.env.API_ENDPOINT;

class Api {

  _token = null;

  get token() {
    return this._token || Cookies.get('token') || null;
  }

  set token(t) {
    if (t) {
      const inOneHour = new Date();
      inOneHour.setTime(inOneHour.getTime() + 50 * 60 * 1000);

      Cookies.set('token', t, { expires: inOneHour });
    }
    this._token = t;
  }

  get({url, authenticated = true}) {
    return fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: authenticated ? {
        Authorization: `Bearer ${this.token}`
      } : undefined
    });
  }

  post({url, data, authenticated = true}) {
    return fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: authenticated ? {
        Authorization: `Bearer ${this.token}`
      } : undefined,
      body: JSON.stringify(data)
    });
  }

  patch({url, data, authenticated = true}) {
    return fetch(`${BASE_URL}${url}`, {
      method: 'PATCH',
      headers: authenticated ? {
        Authorization: `Bearer ${this.token}`
      } : undefined,
      body: JSON.stringify(data)
    });
  }

  delete({url, data, authenticated = true}) {
    return fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: authenticated ? {
        Authorization: `Bearer ${this.token}`
      } : undefined,
      body: data ? JSON.stringify(data) : undefined
    });
  }

  getLyftUrl() {
    return this.get(
      {url: '/lyft-account/url', authenticated: false}
    ).then(
      response => response.json()
    ).then(
      data => data.url
    );
  }

  getLyftAccount() {
    return this.get({url: '/lyft-account'}).then(response => response.json());
  }

  createLyftAccount(code, state) {
    return this.post({
      url: '/lyft-account',
      data: {code, state},
      authenticated: false
    }).then(
      response => {
        if (response.status !== 200) {
          throw Error(response.text());
        } else {
          return response.json();
        }
      }
    );
  }

  getDashButton() {
    return this.get({url: '/dash-button'}).then(
      response => {
        if (response.status === 404) {
          return null;
        } else {
          return response.json();
        }
      }
    );
  }

  editDashButton(partialButton) {
    return this.patch({
      url: '/dash-button',
      data: partialButton
    }).then(
      response => {
        if (response.status !== 200) {
          throw Error(response.text());
        } else {
          return response.json()
        }
      }
    );
  }

  deleteDashButton() {
    return this.delete({ url: '/dash-button', authenticated: true });
  }

  async getGoogleAccount() {
    const response = await this.get(
      {url: '/google-account'}
    )

    if (response.status === 200) {
      return await response.json();
    } else if (response.status === 404) {
      throw await response.json();
    } else {
      throw Error(response.text());
    }
  }

  async createGoogleAccount(code) {
    const response = await this.post(
      { url: '/google-account', data: { code }}
    );

    return response.json();
  }

  deleteGoogleAccount(code) {
    return this.delete({ url: '/google-account', authenticated: true });
  }
}

export default new Api();

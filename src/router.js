import page from 'page';
import qs from 'qs';

import { send } from './flux.js';

let query;

page('/', async function main(ctx){
  query = qs.parse(ctx.querystring);
  send('page-loaded', query);
});

export default {
  init: () => page(),
  getQuery: () => query,
  go: route => page(route)
}

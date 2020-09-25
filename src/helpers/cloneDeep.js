export default function c(o, i, r) {
  /* eslint-disable */
  if (o && typeof o === 'object') {
    r = o instanceof Array ? [] : {};
    for (i in o) {
      o.hasOwnProperty(i) ? r[i] = o[i] === o ? r : c(o[i]) : 0;
    }
  }
  return r || o;
  /* eslint-enable */
}

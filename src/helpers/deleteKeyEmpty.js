export default (object) => {
  const obj = object;

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string' && obj[key] === '') {
      delete obj[key];
    }

    if (Array.isArray(obj[key])) {
      if (obj[key].length === 0) {
        delete obj[key];
      }
    }
  });

  return obj;
};

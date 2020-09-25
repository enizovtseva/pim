export default (date, time) => {
  const dateSplit = date.split('.');
  const dateFormat = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
  return time ? Date.parse(`${dateFormat} ${time}`) / 1000 : Date.parse(dateFormat) / 1000;
};

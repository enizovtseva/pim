export default (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear().toString();
  const month = date.getMonth() >= 9 ? (date.getMonth() + 1).toString() : `0${(date.getMonth() + 1).toString()}`;
  const day = date.getDate() > 9 ? date.getDate().toString() : `0${date.getDate().toString()}`;
  return `${day}.${month}.${year}`;
};

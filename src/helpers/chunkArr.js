export default (arr, size) => {
  const res = new Array(size);
  for (let i = 0; i < size; i += 1) {
    res[i] = [];
  }
  for (let i = 0; i < arr.length; i += 1) {
    res[i % size].push(arr[i]);
  }
  return res;
};

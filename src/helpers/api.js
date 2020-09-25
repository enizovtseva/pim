/* eslint linebreak-style: ["error", "unix"] */
import axios from 'axios';

export default (axiosAction, axiosUrl, axiosData, axiosCallback, axiosCallbackCatch) => {
  axios({
    method: axiosAction,
    url: axiosUrl,
    data: axiosData,
    headers: { Authorization: 'Token 3a79cf367b8fd464cc440e35cc6329a1c13f5784' },
  }).then((res) => { axiosCallback(res); })
    .catch((error) => { axiosCallbackCatch(error); });
};

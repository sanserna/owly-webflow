import axios from 'axios';

function composeUrl(url, params = {}) {
  const matches = url.match(/\{([a-zA-Z0-9_]+)}/g);

  if (matches) {
    let parsedUrl = url;

    matches.forEach((match) => {
      const name = match.replace(/{?}?/g, '');

      parsedUrl = parsedUrl.replace(match, params[name] || '');
    });

    return parsedUrl;
  }

  return url;
}

export default function createHttpClient({
  baseURL,
  headers = {},
  endpoints = {},
  timeout = 30000,
}) {
  const axiosInstance = axios.create({ baseURL, headers, timeout });
  const httpClient = {};

  Object.keys(endpoints).forEach((endpointName) => {
    const { url, method } = endpoints[endpointName];

    httpClient[endpointName] = ({ urlParams, config = {}, data = {} } = {}) => {
      const composedUrl = composeUrl(url, urlParams);

      let apiCall = axiosInstance[method](composedUrl, data, config);

      if (['get', 'delete', 'head', 'options'].includes(method)) {
        apiCall = axiosInstance[method](composedUrl, config);
      }

      return apiCall;
    };
  });
}

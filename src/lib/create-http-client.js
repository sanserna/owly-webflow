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

function createHttpClient({
  baseURL,
  headers = {},
  endpoints = {},
  timeout = 30000,
}) {
  const axiosInstance = axios.create({ baseURL, headers, timeout });
  const httpClient = {};

  Object.entries(endpoints).forEach(([endpointName, options]) => {
    const { url, method } = options;

    httpClient[endpointName] = ({ urlParams, config = {}, data = {} } = {}) => {
      const composedUrl = composeUrl(url, urlParams);

      if (['get', 'delete', 'head', 'options'].includes(method)) {
        return axiosInstance[method](composedUrl, config);
      }

      return axiosInstance[method](composedUrl, data, config);
    };
  });

  return httpClient;
}

export default createHttpClient;

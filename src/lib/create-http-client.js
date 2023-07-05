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

/**
 * Endpoint call options
 * @typedef {Object} EndpointCallOptions
 * @property {Object} [urlParams] - params used to compose the API url
 * @property {RequestConfig} [config] - axios config
 * @property {Object} [data] - data
 */

/**
 * @typedef {import('axios').AxiosRequestConfig} RequestConfig
 * @typedef {import('axios').AxiosResponse} Response
 * @callback EndpointCallFn
 * @param {EndpointCallOptions} [options] - endpoint call options
 * @returns {Promise<Response>}
 */

/**
 * Create http client
 * @typedef {{
 *   method: ('get'|'post'|'delete'|'head'|'options')
 *   url: string
 * }} EndpointConfig
 * @param {Object} options - http client config options
 * @param {string} options.baseURL - the server URL that will be used for the request
 * @param {Object<string, string>} [options.headers={}] - custom headers to be sent
 * @param {Object<string, EndpointConfig>} [options.endpoints={}] - endpoints config
 * @param {number} [options.timeout=30000] - the number of milliseconds before the request times out
 * @returns {Object<string, EndpointCallFn>}
 */
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

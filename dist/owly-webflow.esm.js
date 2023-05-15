import axios from 'axios';

const environment = {
  apis: {
    owly: {
      baseURL: 'https://owly.com.co/owly-api/index.php',
      endpoints: {
        getProject: {
          method: 'get',
          uri: '/project/{projectId}',
        },
      },
    },
  },
};

// Uri params interpolation
function getURI(uri, params = {}) {
  const matches = uri.match(/\{([a-zA-Z0-9_]+)}/g);

  if (matches) {
    let parsedUri = uri;

    matches.forEach((match) => {
      const name = match.replace(/{?}?/g, '');

      parsedUri = parsedUri.replace(match, params[name] || '');
    });

    return parsedUri;
  }

  return uri;
}

class HttpClient {
  constructor({ baseURL, headers, endpoints = {}, timeout = 30000 }) {
    this.client = axios.create({ baseURL, headers, timeout });

    Object.keys(endpoints).forEach((endpointName) => {
      const { uri, method } = endpoints[endpointName];

      this[endpointName] = ({ urlParams, config = {}, data = {} } = {}) => {
        const composedUri = getURI(uri, urlParams);
        const abortController = new AbortController();
        const requestConfig = {
          ...config,
          signal: abortController.signal,
        };

        let apiCall;

        if (['get', 'delete', 'head', 'options'].includes(method)) {
          apiCall = this.client[method](composedUri, requestConfig);
        } else {
          apiCall = this.client[method](composedUri, data, requestConfig);
        }

        apiCall.abort = () => abortController.abort();

        return apiCall;
      };
    });
  }
}

const api = Object.keys(environment.apis).reduce((apis, apiName) => {
  const apiConfig = environment.apis[apiName];

  apis[apiName] = new HttpClient(apiConfig);

  return apis;
}, {});

async function getProjectAvailability(options) {
  const { product, companyCode, projectId, itemCallback } = options;

  const { status, data } = await api.owly.getProject({
    config: {
      headers: {
        product,
        'company-code': companyCode,
      },
    },
    urlParams: {
      projectId,
    },
  });

  if (status === 200 && data.items?.length) {
    data.items.forEach((item) => {
      if (itemCallback && typeof itemCallback === 'function') {
        itemCallback(item);
      }
    });
  }
}

export { getProjectAvailability };

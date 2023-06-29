(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios')) :
  typeof define === 'function' && define.amd ? define(['exports', 'axios'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.owlyWebflow = {}, global.axios));
})(this, (function (exports, axios) { 'use strict';

  const environment = {
    apis: {
      owly: {
        baseURL: 'https://owly.com.co/owly-api/index.php',
        endpoints: {
          getProject: {
            method: 'get',
            url: '/project/{projectId}'
          }
        }
      }
    }
  };

  function composeUrl(url) {
    let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const matches = url.match(/\{([a-zA-Z0-9_]+)}/g);
    if (matches) {
      let parsedUrl = url;
      matches.forEach(match => {
        const name = match.replace(/{?}?/g, '');
        parsedUrl = parsedUrl.replace(match, params[name] || '');
      });
      return parsedUrl;
    }
    return url;
  }
  function createHttpClient(_ref) {
    let {
      baseURL,
      headers = {},
      endpoints = {},
      timeout = 30000
    } = _ref;
    const axiosInstance = axios.create({
      baseURL,
      headers,
      timeout
    });
    const httpClient = {};
    Object.entries(endpoints).forEach(_ref2 => {
      let [endpointName, options] = _ref2;
      const {
        url,
        method
      } = options;
      httpClient[endpointName] = function () {
        let {
          urlParams,
          config = {},
          data = {}
        } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        const composedUrl = composeUrl(url, urlParams);
        if (['get', 'delete', 'head', 'options'].includes(method)) {
          return axiosInstance[method](composedUrl, config);
        }
        return axiosInstance[method](composedUrl, data, config);
      };
    });
    return httpClient;
  }

  const owlyHttpClient = createHttpClient(environment.apis.owly);
  async function getProjectAvailability(options) {
    var _data$items;
    const {
      product,
      companyCode,
      projectId,
      token,
      itemCallback,
      limit = 400
    } = options;
    const {
      status,
      data
    } = await owlyHttpClient.getProject({
      config: {
        headers: {
          product,
          'company-code': companyCode
        },
        params: {
          limit,
          token
        }
      },
      urlParams: {
        projectId
      }
    });
    if (status === 200 && (_data$items = data.items) !== null && _data$items !== void 0 && _data$items.length) {
      data.items.forEach(item => {
        if (itemCallback && typeof itemCallback === 'function') {
          itemCallback(item);
        }
      });
    }
  }

  exports.getProjectAvailability = getProjectAvailability;

}));
//# sourceMappingURL=owly-webflow.umd.js.map

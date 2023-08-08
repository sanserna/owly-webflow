(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios'), require('parsleyjs')) :
  typeof define === 'function' && define.amd ? define(['exports', 'axios', 'parsleyjs'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.owlyWebflow = {}, global.axios, global.parsley));
})(this, (function (exports, axios, Parsley) { 'use strict';

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

  /**
   * @typedef {import('./lib/create-http-client').EndpointCallFn} EndpointCallFn
   * @typedef {Object} OwlyHttpClient
   * @property {EndpointCallFn} getProject
   * @property {EndpointCallFn} createLead
   */

  /** @type {OwlyHttpClient} */
  const owlyApiHttpClient = createHttpClient({
    baseURL: 'https://api.owly.com.co',
    endpoints: {
      getProject: {
        method: 'get',
        url: '/projects/{projectId}'
      },
      createLead: {
        method: 'post',
        url: '/leads/'
      }
    }
  });

  async function getProjectAvailability(options) {
    var _project$items;
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
    } = await owlyApiHttpClient.getProject({
      config: {
        params: {
          product,
          companyCode,
          limit,
          token
        }
      },
      urlParams: {
        projectId
      }
    });
    const {
      project
    } = data;
    if (status === 200 && (_project$items = project.items) !== null && _project$items !== void 0 && _project$items.length) {
      project.items.forEach(item => {
        if (itemCallback && typeof itemCallback === 'function') {
          itemCallback(item);
        }
      });
    }
  }

  const getFormElementData = $formElement => $formElement.serializeArray().reduce((acc, _ref) => {
    let {
      name,
      value
    } = _ref;
    return {
      ...acc,
      [name]: value
    };
  }, {});
  function submitHandler(event) {
    const $formElement = event.$element;
    const $submitBtn = $formElement.find('button[type=submit]');
    const $alert = $formElement.find('div[role=alert]');
    $submitBtn.prop('disabled', true);
    owlyApiHttpClient.createLead({
      data: getFormElementData($formElement)
    }).then(() => {
      $submitBtn.prop('disabled', false);
      $formElement.trigger('reset');
      $alert.removeClass('d-none');
      setTimeout(() => $alert.addClass('d-none'), 5000);
      event.reset();
    });
    return false;
  }
  async function initForm(formSelector) {
    const parsley = new Parsley.Factory(formSelector, {
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      errorsWrapper: '<div class="invalid-feedback"></div>',
      errorTemplate: '<div></div>'
    });
    parsley.on('form:submit', submitHandler);
  }

  exports.getProjectAvailability = getProjectAvailability;
  exports.initForm = initForm;

}));
//# sourceMappingURL=owly-webflow.umd.js.map

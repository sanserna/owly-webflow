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
   * @property {EndpointCallFn} getProjectTower
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
      getProjectTower: {
        method: 'get',
        url: '/projects/{projectId}/towers/{towerId}'
      },
      createLead: {
        method: 'post',
        url: '/leads/'
      }
    }
  });

  async function getProjectAvailability(options) {
    var _project$units;
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
    if (status === 200 && (_project$units = project.units) !== null && _project$units !== void 0 && _project$units.length) {
      project.units.forEach(unit => {
        if (itemCallback && typeof itemCallback === 'function') {
          itemCallback(unit);
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

  const availabilityCriteria = 'sold';
  const formatNumberES = function (n) {
    let d = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    n = new Intl.NumberFormat('es-ES').format(parseFloat(n).toFixed(d));
    if (d > 0) {
      const decimals = n.indexOf(',') > -1 ? n.length - 1 - n.indexOf(',') : 0;
      n = decimals == 0 ? n + ',' + '0'.repeat(d) : n + '0'.repeat(d - decimals);
    }
    return n;
  };
  const formatTowerType = text => {
    if (text.includes('_')) {
      const array = text.split('_');
      array.forEach((element, index, array) => {
        array[index] = element[0].toUpperCase() + element.slice(1);
      });
      return array.join(' ');
    }
    return 'Proyecto ' + text[0].toUpperCase() + text.slice(1);
  };
  const formatDate = date => {
    const [year, month] = date.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[month - 1]} de ${year}`;
  };
  const getMinimumPrice = (array, attribute) => {
    let minimumPrice;
    if (array.every(e => e.available === availabilityCriteria)) {
      array.forEach((element, i) => {
        if (i === 0) minimumPrice = element[attribute];
        if (element[attribute] < minimumPrice) {
          minimumPrice = element[attribute];
        }
      });
    } else {
      array.forEach(element => {
        if (element.available !== availabilityCriteria && !minimumPrice) minimumPrice = element[attribute];
        if (element.available !== availabilityCriteria && element[attribute] <= minimumPrice) {
          minimumPrice = element[attribute];
        }
      });
    }
    return `${formatNumberES(minimumPrice)}`;
  };
  const getAreas = (array, attribute) => {
    let min, max;
    if (array.every(e => e.available === availabilityCriteria)) {
      array.forEach((element, i) => {
        if (i === 0) {
          min = element[attribute];
          max = element[attribute];
        }
        if (element[attribute] < min) {
          min = element[attribute];
        }
        if (element[attribute] > max) {
          max = element[attribute];
        }
      });
    } else {
      array.forEach(element => {
        if (element.available !== availabilityCriteria && !min) {
          min = element[attribute];
        }
        if (element.available !== availabilityCriteria && !max) {
          max = element[attribute];
        }
        if (element.available !== availabilityCriteria && element[attribute] < min) {
          min = element[attribute];
        }
        if (element.available !== availabilityCriteria && element[attribute] > max) {
          max = element[attribute];
        }
      });
    }
    return min === max ? `${max} m²` : `${min} a ${max} m²`;
  };
  const enumerator = (array, attribute) => {
    let quantities = [];
    if (array.every(e => e.available === availabilityCriteria)) {
      array.forEach((element, i) => {
        if (i === 0) {
          quantities.push(element[attribute]);
        }
        if (!quantities.includes(element[attribute])) {
          quantities.push(element[attribute]);
        }
      });
    } else {
      array.forEach((element, i) => {
        if (element.available !== availabilityCriteria && !quantities.includes(element[attribute])) {
          quantities.push(element[attribute]);
        }
      });
    }
    if (quantities.length === 1) return quantities[0];
    quantities.sort((a, b) => a - b);
    const last = quantities.pop();
    return quantities.join(', ') + ' y ' + last;
  };

  async function getVecindario(constants) {
    const {
      projectId,
      BASE_QUOTER_ID,
      towerId,
      typologies = {},
      root
    } = constants;
    try {
      const {
        status: propertiesStatus,
        data: {
          project: {
            tower: {
              units
            }
          }
        }
      } = await owlyApiHttpClient.getProjectTower({
        config: {
          params: {
            product: 'vecindario'
          }
        },
        urlParams: {
          projectId,
          towerId
        }
      });
      const pathname = window.location.pathname;
      if (pathname === '/' || pathname === root || pathname === root + '/' || pathname === `${root}/index.html`) {
        // Sección de inicio
        const {
          status: towersStatus,
          data: {
            project: {
              towers
            }
          }
        } = await owlyApiHttpClient.getProject({
          config: {
            params: {
              product: 'vecindario'
            }
          },
          urlParams: {
            projectId
          }
        });
        if (towersStatus === 200) {
          const towerType = document.getElementById('tower-type');
          const totalTowers = document.getElementById('total-towers');
          const deadline = document.getElementById('deadline');
          if (towerType) towerType.innerHTML = formatTowerType(towers[0].towerType);
          if (totalTowers) totalTowers.innerHTML = towers.length;
          if (deadline) deadline.innerHTML = formatDate(towers[0].deadline);
        }
        if (propertiesStatus === 200) {
          const totalProperties = document.getElementById('total-properties');
          const minimumPrice = document.getElementById('minimum-price');
          const areas = document.getElementById('areas');
          const bedrooms = document.getElementById('bedrooms');
          const bathrooms = document.getElementById('bathrooms');
          if (totalProperties) totalProperties.innerHTML = units.length;
          if (minimumPrice) minimumPrice.innerHTML = getMinimumPrice(units, 'finalPrice');
          if (areas) areas.innerHTML = getAreas(units, 'builtArea');
          if (bedrooms) bedrooms.innerHTML = enumerator(units, 'bedrooms');
          if (bathrooms) bathrooms.innerHTML = enumerator(units, 'bathrooms');
        }
      } else {
        var _secondParam, _thirdParam;
        let fit = 0;
        if (root) fit = root.split('/').length - 1;
        let secondParam = pathname.split('/')[2 + fit];
        let thirdParam = pathname.split('/')[3 + fit];
        if ((_secondParam = secondParam) !== null && _secondParam !== void 0 && _secondParam.includes('.html')) secondParam = secondParam.split('.html')[0];
        if ((_thirdParam = thirdParam) !== null && _thirdParam !== void 0 && _thirdParam.includes('.html')) thirdParam = thirdParam.split('.html')[0];
        if (secondParam) {
          if (propertiesStatus === 200) {
            const [isType, type] = secondParam.split('-');
            if (isType === 'tipo') {
              // Sección de tipologías
              const typeName = document.getElementById('type-name');
              const typeMinPrice = document.getElementById('type-min-price');
              const builtArea = document.getElementById('built-area');
              const privateArea = document.getElementById('private-area');
              const typeBedrooms = document.getElementById('type-bedrooms');
              const typeBathrooms = document.getElementById('type-bathrooms');
              const unitsByType = [];
              units.forEach(unit => {
                if (unit.type.toUpperCase() === type.toUpperCase()) unitsByType.push(unit);
              });
              if (typeName && unitsByType.length) typeName.innerHTML = `Tipo ${unitsByType[0].type}`;
              if (typeMinPrice) typeMinPrice.innerHTML = getMinimumPrice(unitsByType, 'finalPrice');
              if (builtArea) builtArea.innerHTML = getAreas(unitsByType, 'builtArea');
              if (privateArea) privateArea.innerHTML = getAreas(unitsByType, 'privateArea');
              if (typeBedrooms) typeBedrooms.innerHTML = enumerator(unitsByType, 'bedrooms');
              if (typeBathrooms) typeBathrooms.innerHTML = enumerator(unitsByType, 'bathrooms');
            }
          }
        }
        if (thirdParam) {
          if (propertiesStatus === 200) {
            const [paramKey, paramValue] = thirdParam.split('-');
            if (paramKey === 'etapa') {
              const floors = document.querySelectorAll('[class~="floor-mask"]');
              if (floors) {
                floors.forEach(floor => {
                  for (let i = 0; i < floor.classList.length; i++) {
                    const className = floor.classList[i];
                    if (className.includes('piso')) {
                      const number = className.split('-')[1];
                      const aptos = units.filter(unit => {
                        return unit.floor.toString() === number.toString();
                      });
                      let allAvailable = 0;
                      aptos.forEach(apto => {
                        if (apto.available !== 'sold') allAvailable += 1;
                      });
                      const tagFloor = floor.querySelector('.fs7--fw2--fcoa');
                      if (tagFloor) tagFloor.innerHTML = `Piso ${number}`;
                      const tagTotal = floor.querySelector('.fs7-2--fcoa');
                      if (tagTotal) tagTotal.innerHTML = `${allAvailable} de ${aptos.length}`;
                      if (allAvailable === 0) {
                        const tagDot = floor.querySelector('.availability-dot');
                        if (tagDot) tagDot.classList.add('danger');
                      }
                    }
                  }
                });
              }
            }
            if (paramKey === 'floor') {
              if (!Object.keys(typologies).length) {
                const {
                  status: typesStatus,
                  data: {
                    project: {
                      tower: {
                        types
                      }
                    }
                  }
                } = await owlyApiHttpClient.getProjectTower({
                  config: {
                    params: {
                      product: 'vecindario',
                      typologies: 'true'
                    }
                  },
                  urlParams: {
                    projectId,
                    towerId
                  }
                });
                if (typesStatus === 200) {
                  types.forEach(typology => {
                    typologies[typology.type] = typology.id;
                  });
                }
              }
              units.sort((a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;else return 0;
              });
              const unitsByType = [];
              units.forEach(unit => {
                if (unit.floor.toString() === paramValue.toString()) unitsByType.push(unit);
              });
              unitsByType.forEach((unit, i) => {
                const apto = document.getElementById(unit.id);
                if (apto) {
                  for (let index = 0; index < apto.children.length; index++) {
                    const child = apto.children[index];
                    if (child.className === 'html-typology w-embed' && unit.available === 'sold') {
                      child.classList.add('danger');
                    }
                    if (child.className === 'tooltip-typology--bbc1--br1') {
                      const tooltipTypologies = child.children;
                      for (let index = 0; index < tooltipTypologies.length; index++) {
                        if (tooltipTypologies[index].className === 'availability-dot' && unit.available === 'sold') {
                          tooltipTypologies[index].classList.add('danger');
                        }
                        if (tooltipTypologies[index].className === 'fs7-2--fw3--fc1') {
                          tooltipTypologies[index].innerHTML = unit.name;
                        }
                      }
                    }
                    if (child.className === 'tooltip-unit-detail bbc1--br2' || child.className === 'tooltip-unit-detail bbc1--br2 show') {
                      const availability = child.querySelector('.fs7-2--fc2');
                      if (availability && unit.available === 'sold') {
                        availability.innerHTML = 'Vendido';
                      }
                      const availabilityDot = child.querySelector('.availability-dot');
                      if (availability && unit.available === 'sold') {
                        availabilityDot.classList.add('danger');
                      }
                      const referencia = child.querySelector('.fs6--fw3--fc1');
                      if (referencia) {
                        referencia.innerHTML = unit.name;
                      }
                      const unitFacts = child.querySelectorAll('.button_main_text');
                      if (unitFacts.length > 0) {
                        unitFacts[0].innerHTML = getAreas([unit], 'builtArea');
                        unitFacts[1].innerHTML = enumerator([unit], 'bedrooms');
                        unitFacts[2].innerHTML = enumerator([unit], 'bathrooms');
                      }
                      const tooltipButtons = child.querySelector('.tooltip-buttons');
                      if (tooltipButtons) {
                        if (unit.available === 'sold') tooltipButtons.classList.add('hide');else {
                          const quoter = tooltipButtons.children[1];
                          const iframeContainer = apto.querySelector('.quoter--bbc1');
                          const quoterIframe = iframeContainer.querySelector('.quoter-iframe');
                          const iframe = quoterIframe.children[0];
                          const url = `https://cotizador.vecindariosuite.com/proyecto/owly-demo/cotizar/${BASE_QUOTER_ID}/?towerId=${towerId}&typologyId=${typologies[unit.type]}&propertyId=${unit.id}`;
                          quoter.addEventListener('click', function (e) {
                            e.preventDefault();
                            if (iframe && typologies[unit.type]) {
                              iframe.setAttribute('src', url);
                              if (iframeContainer.classList.contains('show')) iframeContainer.classList.remove('show');else iframeContainer.classList.add('show');
                            }
                          });
                        }
                      }
                    }
                  }
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  exports.getProjectAvailability = getProjectAvailability;
  exports.getVecindario = getVecindario;
  exports.initForm = initForm;

}));
//# sourceMappingURL=owly-webflow.umd.js.map

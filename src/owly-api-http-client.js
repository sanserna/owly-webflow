import createHttpClient from './lib/create-http-client';

/**
 * @typedef {import('./lib/create-http-client').EndpointCallFn} EndpointCallFn
 * @typedef {Object} OwlyHttpClient
 * @property {EndpointCallFn} getProject
 * @property {EndpointCallFn} getProjectTower
 * @property {EndpointCallFn} createLead
 */

/** @type {OwlyHttpClient} */
export const owlyApiHttpClient = createHttpClient({
  baseURL: 'https://api.owly.com.co',
  endpoints: {
    getProject: {
      method: 'get',
      url: '/projects/{projectId}',
    },
	getProjectTower: {
	  method: 'get',
      url: '/projects/{projectId}/towers/{towerId}',
	},
    createLead: {
      method: 'post',
      url: '/leads/',
    },
  },
});

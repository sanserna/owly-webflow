import createHttpClient from './lib/create-http-client';

/**
 * @typedef {import('./lib/create-http-client').EndpointCallFn} EndpointCallFn
 * @typedef {Object} OwlyHttpClient
 * @property {EndpointCallFn} getProject
 */

/** @type {OwlyHttpClient} */
export const owlyApiHttpClient = createHttpClient({
  baseURL: 'https://nhgw4slkta.execute-api.us-east-1.amazonaws.com',
  endpoints: {
    getProject: {
      method: 'get',
      url: '/projects/{projectId}',
    },
  },
});

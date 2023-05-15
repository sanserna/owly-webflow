import { environment } from 'owly-webflow-config/environment';
import HttpClient from './http-client';

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

export default getProjectAvailability;

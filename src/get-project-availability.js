import { environment } from '@app-config/environment';
import createHttpClient from './lib/create-http-client';

const owlyHttpClient = createHttpClient(environment.apis.owly);

async function getProjectAvailability(options) {
  const {
    product,
    companyCode,
    projectId,
    token,
    itemCallback,
    limit = 400,
  } = options;

  const { status, data } = await owlyHttpClient.getProject({
    config: {
      headers: {
        product,
        'company-code': companyCode,
      },
      params: { limit, token },
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

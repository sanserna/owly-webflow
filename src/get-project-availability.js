import { owlyApiHttpClient } from './owly-api-http-client';

export default async function getProjectAvailability(options) {
  const {
    product,
    companyCode,
    projectId,
    token,
    itemCallback,
    limit = 400,
  } = options;

  const { status, data } = await owlyApiHttpClient.getProject({
    config: {
      params: {
        product,
        companyCode,
        limit,
        token,
      },
    },
    urlParams: {
      projectId,
    },
  });
  const { project } = data;

  if (status === 200 && project.items?.length) {
    project.items.forEach((item) => {
      if (itemCallback && typeof itemCallback === 'function') {
        itemCallback(item);
      }
    });
  }
}

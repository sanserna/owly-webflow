import { owlyApiHttpClient } from './owly-api-http-client';

export default async function getProjectAvailability(options) {
  const {
    product,
    companyCode,
    projectId,
    projectSlug, // Agregado para Alterestate
    token,
    itemCallback,
    limit = 400,
  } = options;

  // Construye los parámetros según el producto:
  // - Para Alterestate se utiliza projectSlug.
  // - Para los demás productos se usan companyCode y projectId.
  const params = product === 'alterestate'
    ? { product, projectSlug, limit, token }
    : { product, companyCode, limit, token };

  const urlParams = product === 'alterestate'
    ? { projectSlug }
    : { projectId };

  const { status, data } = await owlyApiHttpClient.getProject({
    config: { params },
    urlParams,
  });
  
  const { project } = data;

  if (status === 200 && project.units?.length) {
    project.units.forEach((unit) => {
      if (itemCallback && typeof itemCallback === 'function') {
        itemCallback(unit);
      }
    });
  }
}
import { owlyApiHttpClient } from './owly-api-http-client';

export default async function getProjectAvailability(options) {
  const {
    product,
    companyCode,
    projectId,  // Usado para todos los productos. En Alterestate, projectId es el slug.
    token,
    itemCallback,
    limit = 400,
  } = options;

  // Construye los parámetros comunes.
  // Para productos distintos a alterestate, se incluye companyCode.
  const params = {
    product,
    limit,
    token,
    ...(product !== 'alterestate' && { companyCode }),
  };

  // Siempre usamos projectId en la URL.
  const urlParams = { projectId };

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
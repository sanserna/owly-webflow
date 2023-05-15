export const environment = {
  apis: {
    owly: {
      baseURL: 'https://owly.com.co/owly-api/index.php',
      endpoints: {
        getProject: {
          method: 'get',
          uri: '/project/{projectId}',
        },
      },
    },
  },
};

export function normalizeData(data, idAttribute = 'id') {
  return data.reduce(
    (acum, current) => ({
      ...acum,
      [current[idAttribute]]: { ...current },
    }),
    {}
  );
}

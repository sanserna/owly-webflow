export function normalizeData(data, idAttribute = 'id') {
  return data.reduce(
    (acum, current) => ({
      ...acum,
      [current[idAttribute]]: { ...current },
    }),
    {}
  );
}

const availabilityCriteria = 'sold';

const formatNumberES = (n, d = 0) => {
  n = new Intl.NumberFormat('es-ES').format(parseFloat(n).toFixed(d));

  if (d > 0) {
    const decimals = n.indexOf(',') > -1 ? n.length - 1 - n.indexOf(',') : 0;
    n = decimals == 0 ? n + ',' + '0'.repeat(d) : n + '0'.repeat(d - decimals);
  }
  return n;
};

export const formatTowerType = (text) => {
  if (text.includes('_')) {
    const array = text.split('_');
    array.forEach((element, index, array) => {
      array[index] = element[0].toUpperCase() + element.slice(1);
    });
    return array.join(' ');
  }
  return 'Proyecto ' + text[0].toUpperCase() + text.slice(1);
};

export const formatDate = (date) => {
  const [year, month] = date.split('-');
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return `${months[month - 1]} de ${year}`;
};

export const getMinimumPrice = (array, attribute) => {
  let minimumPrice;
  if (array.every((e) => e.available === availabilityCriteria)) {
    array.forEach((element, i) => {
      if (i === 0) minimumPrice = element[attribute];
      if (element[attribute] < minimumPrice) {
        minimumPrice = element[attribute];
      }
    });
  } else {
    array.forEach((element) => {
      if (element.available !== availabilityCriteria && !minimumPrice)
        minimumPrice = element[attribute];
      if (
        element.available !== availabilityCriteria &&
        element[attribute] <= minimumPrice
      ) {
        minimumPrice = element[attribute];
      }
    });
  }
  return `${formatNumberES(minimumPrice)}`;
};

export const getAreas = (array, attribute) => {
  let min, max;
  if (array.every((e) => e.available === availabilityCriteria)) {
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
    array.forEach((element) => {
      if (element.available !== availabilityCriteria && !min) {
        min = element[attribute];
      }
      if (element.available !== availabilityCriteria && !max) {
        max = element[attribute];
      }
      if (
        element.available !== availabilityCriteria &&
        element[attribute] < min
      ) {
        min = element[attribute];
      }
      if (
        element.available !== availabilityCriteria &&
        element[attribute] > max
      ) {
        max = element[attribute];
      }
    });
  }
  return min === max ? `${max} m²` : `${min} a ${max} m²`;
};

export const enumerator = (array, attribute) => {
  let quantities = [];
  if (array.every((e) => e.available === availabilityCriteria)) {
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
      if (
        element.available !== availabilityCriteria &&
        !quantities.includes(element[attribute])
      ) {
        quantities.push(element[attribute]);
      }
    });
  }
  if (quantities.length === 1) return quantities[0];
  quantities.sort((a, b) => a - b);
  const last = quantities.pop();
  return quantities.join(', ') + ' y ' + last;
};

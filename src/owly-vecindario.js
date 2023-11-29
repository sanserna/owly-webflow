import { owlyApiHttpClient } from './owly-api-http-client';
import {
  enumerator,
  formatDate,
  formatTowerType,
  getAreas,
  getMinimumPrice,
} from './lib/utils';

export default async function getVecindario(constants) {
  const {
    projectId,
    BASE_QUOTER_ID,
    towerId,
    typologies = {},
    root,
  } = constants;

  try {
    const {
      status: propertiesStatus,
      data: {
        project: {
          tower: { units },
        },
      },
    } = await owlyApiHttpClient.getProjectTower({
      config: {
        params: {
          product: 'vecindario',
        },
      },
      urlParams: {
        projectId,
        towerId,
      },
    });
    const pathname = window.location.pathname;
    if (
      pathname === '/' ||
      pathname === root ||
      pathname === root + '/' ||
      pathname === `${root}/index.html`
    ) {
      // Sección de inicio
      const {
        status: towersStatus,
        data: {
          project: { towers },
        },
      } = await owlyApiHttpClient.getProject({
        config: {
          params: {
            product: 'vecindario',
          },
        },
        urlParams: {
          projectId,
        },
      });
      if (towersStatus === 200) {
        const towerType = document.getElementById('tower-type');
        const totalTowers = document.getElementById('total-towers');
        const deadline = document.getElementById('deadline');
        if (towerType)
          towerType.innerHTML = formatTowerType(towers[0].towerType);
        if (totalTowers) totalTowers.innerHTML = towers.length;
        if (deadline) deadline.innerHTML = formatDate(towers[0].deadline);
      }
      if (propertiesStatus === 200) {
        const totalProperties = document.getElementById('total-properties');
        const minimumPrice = document.getElementById('minimum-price');
        const areas = document.getElementById('areas');
        const bedrooms = document.getElementById('bedrooms');
        const bathrooms = document.getElementById('bathrooms');
        if (totalProperties) totalProperties.innerHTML = units.length;
        if (minimumPrice)
          minimumPrice.innerHTML = getMinimumPrice(units, 'finalPrice');
        if (areas) areas.innerHTML = getAreas(units, 'builtArea');
        if (bedrooms) bedrooms.innerHTML = enumerator(units, 'bedrooms');
        if (bathrooms) bathrooms.innerHTML = enumerator(units, 'bathrooms');
      }
    } else {
      let fit = 0;
      if (root) fit = root.split('/').length - 1;
      let secondParam = pathname.split('/')[2 + fit];
      let thirdParam = pathname.split('/')[3 + fit];
      if (secondParam?.includes('.html'))
        secondParam = secondParam.split('.html')[0];
      if (thirdParam?.includes('.html'))
        thirdParam = thirdParam.split('.html')[0];
      if (secondParam) {
        if (propertiesStatus === 200) {
          const [isType, type] = secondParam.split('-');
          if (isType === 'tipo') {
            // Sección de tipologías
            const typeName = document.getElementById('type-name');
            const typeMinPrice = document.getElementById('type-min-price');
            const builtArea = document.getElementById('built-area');
            const privateArea = document.getElementById('private-area');
            const typeBedrooms = document.getElementById('type-bedrooms');
            const typeBathrooms = document.getElementById('type-bathrooms');

            const unitsByType = [];
            units.forEach((unit) => {
              if (unit.type.toUpperCase() === type.toUpperCase())
                unitsByType.push(unit);
            });
            if (typeName && unitsByType.length)
              typeName.innerHTML = `Tipo ${unitsByType[0].type}`;
            if (typeMinPrice)
              typeMinPrice.innerHTML = getMinimumPrice(
                unitsByType,
                'finalPrice'
              );
            if (builtArea)
              builtArea.innerHTML = getAreas(unitsByType, 'builtArea');
            if (privateArea)
              privateArea.innerHTML = getAreas(unitsByType, 'privateArea');
            if (typeBedrooms)
              typeBedrooms.innerHTML = enumerator(unitsByType, 'bedrooms');
            if (typeBathrooms)
              typeBathrooms.innerHTML = enumerator(unitsByType, 'bathrooms');
          }
        }
      }
      if (thirdParam) {
        if (propertiesStatus === 200) {
          const [paramKey, paramValue] = thirdParam.split('-');
          if (paramKey === 'etapa') {
            const floors = document.querySelectorAll('[class~="floor-mask"]');
            if (floors) {
              floors.forEach((floor) => {
                for (let i = 0; i < floor.classList.length; i++) {
                  const className = floor.classList[i];
                  if (className.includes('piso')) {
                    const number = className.split('-')[1];
                    const aptos = units.filter((unit) => {
                      return unit.floor.toString() === number.toString();
                    });
                    let allAvailable = 0;
                    aptos.forEach((apto) => {
                      if (apto.available !== 'sold') allAvailable += 1;
                    });
					const tagFloor = floor.querySelector('.fs7--fw2--fcoa')
					if (tagFloor) tagFloor.innerHTML = `Piso ${number}`;
					const tagTotal = floor.querySelector('.fs7-2--fcoa')
					if (tagTotal) tagTotal.innerHTML = `${allAvailable} de ${aptos.length}`;
                    if (allAvailable === 0) {
						const tagDot = floor.querySelector('.availability-dot');
						if (tagDot) tagDot.classList.add('danger')
                    }
                  }
                }
              });
            }
          }
          if (paramKey === 'floor') {
            if (!Object.keys(typologies).length) {
              const {
                status: typesStatus,
                data: {
                  project: {
                    tower: { types },
                  },
                },
              } = await owlyApiHttpClient.getProjectTower({
                config: {
                  params: {
                    product: 'vecindario',
                    typologies: 'true',
                  },
                },
                urlParams: {
                  projectId,
                  towerId,
                },
              });
              if (typesStatus === 200) {
                types.forEach((typology) => {
                  typologies[typology.type] = typology.id;
                });
              }
            }

            units.sort((a, b) => {
              if (a.name > b.name) return 1;
              if (a.name < b.name) return -1;
              else return 0;
            });
            const unitsByType = [];
            units.forEach((unit) => {
              if (unit.floor.toString() === paramValue.toString())
                unitsByType.push(unit);
            });
            unitsByType.forEach((unit, i) => {
              const apto = document.getElementById(unit.id);
              if (apto) {
                for (let index = 0; index < apto.children.length; index++) {
                  const child = apto.children[index];
                  if (
                    child.className === 'html-typology w-embed' &&
                    unit.available === 'sold'
                  ) {
                    child.classList.add('danger');
                  }
                  if (child.className === 'tooltip-typology--bbc1--br1') {
                    const tooltipTypologies = child.children;
                    for (
                      let index = 0;
                      index < tooltipTypologies.length;
                      index++
                    ) {
                      if (
                        tooltipTypologies[index].className ===
                          'availability-dot' &&
                        unit.available === 'sold'
                      ) {
                        tooltipTypologies[index].classList.add('danger');
                      }
                      if (
                        tooltipTypologies[index].className === 'fs7-2--fw3--fc1'
                      ) {
                        tooltipTypologies[index].innerHTML = unit.name;
                      }
                    }
                  }
                  if (
                    child.className === 'tooltip-unit-detail bbc1--br2' ||
                    child.className === 'tooltip-unit-detail bbc1--br2 show'
                  ) {
                    const availability = child.querySelector('.fs7-2--fc2');
                    if (availability && unit.available === 'sold') {
                      availability.innerHTML = 'Vendido';
                    }
                    const availabilityDot =
                      child.querySelector('.availability-dot');
                    if (availability && unit.available === 'sold') {
                      availabilityDot.classList.add('danger');
                    }
                    const referencia = child.querySelector('.fs6--fw3--fc1');
                    if (referencia) {
                      referencia.innerHTML = unit.name;
                    }
                    const unitFacts =
                      child.querySelectorAll('.button_main_text');
                    if (unitFacts.length > 0) {
                      unitFacts[0].innerHTML = getAreas([unit], 'builtArea');
                      unitFacts[1].innerHTML = enumerator([unit], 'bedrooms');
                      unitFacts[2].innerHTML = enumerator([unit], 'bathrooms');
                    }
                    const tooltipButtons =
                      child.querySelector('.tooltip-buttons');
                    if (tooltipButtons) {
                      if (unit.available === 'sold')
                        tooltipButtons.classList.add('hide');
                      else {
                        const quoter = tooltipButtons.children[1];
                        const iframeContainer =
                          apto.querySelector('.quoter--bbc1');
                        const quoterIframe =
                          iframeContainer.querySelector('.quoter-iframe');

                        const iframe = quoterIframe.children[0];
                        const url = `https://cotizador.vecindariosuite.com/proyecto/owly-demo/cotizar/${BASE_QUOTER_ID}/?towerId=${towerId}&typologyId=${
                          typologies[unit.type]
                        }&propertyId=${unit.id}`;
                        quoter.addEventListener('click', function (e) {
                          e.preventDefault();

                          if (iframe && typologies[unit.type]) {
                            iframe.setAttribute('src', url);
                            if (iframeContainer.classList.contains('show'))
                              iframeContainer.classList.remove('show');
                            else iframeContainer.classList.add('show');
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

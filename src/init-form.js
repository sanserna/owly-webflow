import Parsley from 'parsleyjs';

import { owlyApiHttpClient } from './owly-api-http-client';

const getFormElementData = ($formElement) =>
  $formElement.serializeArray().reduce(
    (acc, { name, value }) => ({
      ...acc,
      [name]: value,
    }),
    {}
  );

function submitHandler(event) {
  const $formElement = event.$element;
  const $submitBtn = $formElement.find('button[type=submit]');
  const $alert = $formElement.find('div[role=alert]');

  $submitBtn.prop('disabled', true);

  owlyApiHttpClient
    .createLead({
      data: getFormElementData($formElement),
    })
    .then(() => {
      $submitBtn.prop('disabled', false);
      $formElement.trigger('reset');
      $alert.removeClass('d-none');
      setTimeout(() => $alert.addClass('d-none'), 5000);
      event.reset();
    });

  return false;
}

export default async function initForm(formSelector) {
  const parsley = new Parsley.Factory(formSelector, {
    errorClass: 'is-invalid',
    successClass: 'is-valid',
    errorsWrapper: '<div class="invalid-feedback"></div>',
    errorTemplate: '<div></div>',
  });

  parsley.on('form:submit', submitHandler);
}

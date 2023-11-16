import stringifyAttributes from 'stringify-attributes';
import collect from 'collect-es';

const functions = [
  // actionUrl
  // alias
  ['ceil', (value) => {
    if (!value || isNaN(value)) {
      return value;
    }
    return Math.ceil(parseFloat(value));
  }],
  // className
  // clone
  ['collect', (value) => { return collect(value); }],
  // combine
  // configure
  // cpUrl
  // create
  // dataUrl
  // date
  // dump
  // expression
  ['floor', (value) => {
    if (!value || isNaN(value)) {
      return value;
    }
    return Math.floor(parseFloat(value));
  }],
  // getenv
  // gql
  // parseEnv
  // parseBooleanEnv
  // plugin
  // renderObjectTemplate
  // seq
  ['shuffle', (value) => { return collect(value).shuffle().all(); }],
  // siteUrl
  // url

  // actionInput
  // attr
  // csrfInput
  // failMessageInput
  ['hiddenInput', (name, value = '', attributes) => {
    if (attributes.hasOwnProperty('_keys')) {
      delete attributes._keys;
    }
    return `<input type="hidden" name="${name}" value="${value}"${stringifyAttributes(attributes)}>`;
  }],
  ['input', (type, name, value = '', attributes) => {
    if (attributes.hasOwnProperty('_keys')) {
      delete attributes._keys;
    }
    return `<input type="${type}" name="${name}" value="${value}"${stringifyAttributes(attributes)}>`;
  }],
  // ol
  // redirectInput
  // successMessageInput
  // svg
  ['tag', (type, attributes) => {
    let text = '';
    let html = '';

    if (attributes.hasOwnProperty('_keys')) {
      delete attributes._keys;
    }

    if (attributes.hasOwnProperty('text')) {
      text = attributes.text;
      delete attributes.text;
    }

    if (attributes.hasOwnProperty('html')) {
      html = attributes.html;
      delete attributes.html;
    }

    if (html === '' && text) {
      html = text;
    }

    return `<${type}${stringifyAttributes(attributes)}>${html}</${type}>`;
  }]
  // ul

  // head
  // beginBody
  // endBody
];

export default functions;

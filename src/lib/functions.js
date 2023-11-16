import stringifyAttributes from 'stringify-attributes';
import collect from 'collect-es';

const functions = [
  // actionUrl
  // alias
  // ceil
  // className
  // clone
  // collect
  ['collect', (value) => { return collect(value); }],
  // combine
  // configure
  // cpUrl
  // create
  // dataUrl
  // date
  // dump
  // expression
  // floor
  // getenv
  // gql
  // parseEnv
  // parseBooleanEnv
  // plugin
  // renderObjectTemplate
  // seq
  // shuffle
  // siteUrl
  // url

  // actionInput
  // attr
  // csrfInput
  // failMessageInput
  // hiddenInput
  // input
  // ol
  // redirectInput
  // successMessageInput
  // svg
  // tag
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

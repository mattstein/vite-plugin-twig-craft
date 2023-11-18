import { marked } from "marked";
import { kebabCase, snakeCase, camelCase, capitalCase, pascalCase } from 'case-anything'
import collect from 'collect.js';
import widont from 'widont';

const filters = [
  // address
  // append
  // ascii
  // atom
  // attr
  // base64_decode
  // base64_encode
  // boolean
  ['camel', function(value) { return camelCase(value); }],
  ['contains', function(value, [ targetKey, targetValue ]) {
    return collect(value).contains(targetKey, targetValue);
  }],
  // currency
  // date
  // datetime
  // diff
  // duration
  // encenc
  // explodeClass
  // explodeStyle
  // filesize
  // filter
  // group
  // hash
  // httpdate
  // id
  // index
  // indexOf
  ['integer', function(value) {
    if (typeof value === 'boolean') {
      return value == 'true' || value == 1;
    }

    if (typeof value === 'array' || typeof value === 'object') {
      return value.length > 0;
    }

    return parseInt(value);
  }],
  ['intersect', function(value, [ secondValue ]) {
    return collect(value).intersect(secondValue).all();
  }],
  ['float', function(value) { return parseFloat(value); }],
  // json_decode
  ['kebab', function(value) { return kebabCase(value); }],
  ['lcfirst', function(value) { return value.charAt(0).toLowerCase() + value.slice(1); }],
  // literal
  ['markdown', function(value) { return marked.parse(value); }],
  ['md', function(value) { return marked.parse(value); }],
  // money
  // multisort
  // namespace
  // namespaceAttributes
  // ns
  // namespaceInputName
  // namespaceInputId
  // number
  // parseAttr
  // parseRefs
  ['pascal', function(value) { return pascalCase(value); }],
  // percentage
  // prepend
  // purify
  // push
  // removeClass
  // rss
  ['snake', function(value) { return snakeCase(value); }],
  // string
  // time
  // timestamp
  // translate
  // truncate
  // t
  ['ucfirst', function(value) { return value.charAt(0).toUpperCase() + value.slice(1); }],
  ['ucwords', function(value) { return capitalCase(value); }],
  ['unique', function(value) { return collect(value).unique().all(); }],
  // unshift
  ['values', function(value) {
    if (value.hasOwnProperty('_keys')) {
      delete value._keys;
    }

    return collect(value).values().all();
  }],
  // where
  ['widont', function(value) { return widont(value); }],
  // without
  // withoutKey
];

export default filters;

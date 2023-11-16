import { marked } from "marked";

const filters = [
  // address
  // append
  // ascii
  // atom
  // attr
  // base64_decode
  // base64_encode
  // boolean
  // camel
  // column
  // contains
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
  // filterByValue
  // group
  // hash
  // httpdate
  // id
  // index
  // indexOf
  // integer
  // intersect
  // float
  // json_decode
  // kebab
  ['lcfirst', function(value) { return value.charAt(0).toLowerCase() + value.slice(1); }],
  // literal
  ['markdown', function(value) { return marked.parse(value); }],
  ['md', function(value) { return marked.parse(value); }],
  // merge
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
  // pascal
  // percentage
  // prepend
  // purify
  // push
  // removeClass
  // rss
  // snake
  // sort
  // string
  // time
  // timestamp
  // translate
  // truncate
  // t
  ['ucfirst', function(value) { return value.charAt(0).toUpperCase() + value.slice(1); }],
  // ucwords
  // unique
  // unshift
  // values
  // where
  // widont
  // without
  // withoutKey
];

export default filters;

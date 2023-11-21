import stringifyAttributes from "stringify-attributes"
import collect from "collect.js"
import { htmlEscape } from "escape-goat"

const renderList = (type, items, params) => {
  let encode = true
  let itemOptions = []

  if (params.hasOwnProperty("_keys")) {
    delete params._keys
  }

  if (params.hasOwnProperty("itemOptions")) {
    itemOptions = params.itemOptions
    delete params.itemOptions

    if (itemOptions.hasOwnProperty("_keys")) {
      delete itemOptions._keys
    }

    if (itemOptions.hasOwnProperty("encode")) {
      encode = itemOptions.encode
      delete itemOptions.encode
    }
  }

  const renderedItems = items.map((item) => {
    let text = encode === true ? htmlEscape(item) : item
    return `<li${stringifyAttributes(itemOptions)}>${text}</li>`
  })

  return `<${type}${stringifyAttributes(params)}>${renderedItems.join(
    ""
  )}</${type}>`
}

const functions = [
  // actionUrl
  // alias
  [
    "ceil",
    (value) => {
      if (!value || isNaN(value)) {
        return value
      }
      return Math.ceil(parseFloat(value))
    },
  ],
  // className
  // clone
  [
    "collect",
    (value) => {
      return collect(value)
    },
  ],
  // combine
  // configure
  // cpUrl
  // create
  // dataUrl
  // date
  // dump
  // expression
  [
    "floor",
    (value) => {
      if (!value || isNaN(value)) {
        return value
      }
      return Math.floor(parseFloat(value))
    },
  ],
  // getenv
  // gql
  // parseEnv
  // parseBooleanEnv
  // plugin
  // renderObjectTemplate
  // seq
  [
    "shuffle",
    (value) => {
      return collect(value).shuffle().all()
    },
  ],
  // siteUrl
  // url

  // actionInput
  // attr
  // csrfInput
  // failMessageInput
  [
    "hiddenInput",
    (name, value = "", attributes) => {
      if (attributes.hasOwnProperty("_keys")) {
        delete attributes._keys
      }
      return `<input type="hidden" name="${name}" value="${value}"${stringifyAttributes(
        attributes
      )}>`
    },
  ],
  [
    "input",
    (type, name, value = "", attributes) => {
      if (attributes.hasOwnProperty("_keys")) {
        delete attributes._keys
      }
      return `<input type="${type}" name="${name}" value="${value}"${stringifyAttributes(
        attributes
      )}>`
    },
  ],
  [
    "ol",
    (items = [], params = {}) => {
      return renderList("ol", items, params)
    },
  ],
  // redirectInput
  // successMessageInput
  // svg
  [
    "tag",
    (type, attributes = {}) => {
      let text = ""
      let html = ""

      if (attributes.hasOwnProperty("_keys")) {
        delete attributes._keys
      }

      if (attributes.hasOwnProperty("text")) {
        text = attributes.text
        delete attributes.text
      }

      if (attributes.hasOwnProperty("html")) {
        html = attributes.html
        delete attributes.html
      }

      if (html === "" && text) {
        html = text
      }

      return `<${type}${stringifyAttributes(attributes)}>${html}</${type}>`
    },
  ],
  [
    "ul",
    (items = [], params = {}) => {
      return renderList("ul", items, params)
    },
  ],
  // head
  // beginBody
  // endBody
]

export default functions

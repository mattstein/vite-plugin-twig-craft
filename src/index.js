import Twig from "twig"
const { twig } = Twig
import { resolve } from "node:path"
import { addCraftExtensions } from "./extensions"
import * as path from "path"

const FRAMEWORK_REACT = "react"
const FRAMEWORK_HTML = "html"

const defaultOptions = {
  namespaces: {},
  filters: {},
  functions: {},
  framework: FRAMEWORK_HTML,
  pattern: /\.(twig)(\?.*)?$/,
}

addCraftExtensions(Twig)
Twig.cache(false)

// Parsed Twig.js token types we’ll need to track as dependencies
const includeTokenTypes = [
  "Twig.logic.type.embed",
  "Twig.logic.type.include",
  "Twig.logic.type.extends",
  "Twig.logic.type.import",
]

// Recursively walks through Twig.js tokens to extract sub-template references
const pluckIncludes = (tokens) => {
  return [
    ...tokens
      .filter((token) => includeTokenTypes.includes(token.token?.type))
      .reduce(
        (carry, token) => [
          ...carry,
          ...token.token.stack.map((stack) => stack.value),
        ],
        []
      ),
    ...tokens.reduce(
      (carry, token) => [...carry, ...pluckIncludes(token.token?.output || [])],
      []
    ),
  ].filter((value, index, array) => {
    return array.indexOf(value) === index
  })
}

// Loads and prepares a template to be used and re-used
const compileTemplate = (id, file, { namespaces, root }) => {
  return new Promise((resolve, reject) => {
    const options = { namespaces, rethrow: true, allowInlineIncludes: true }
    twig({
      id,
      path: normalizeFilePath(file, root),
      error: reject,
      allowInlineIncludes: true,
      load(template) {
        if (typeof template.tokens === "undefined") {
          reject("Error compiling Twig file")
          return
        }
        resolve({
          includes: pluckIncludes(template.tokens),
          code: template.compile(options),
        })
      },
    })
  })
}

const errorHandler =
  (id, isDefault = true) =>
  (e) => {
    if (isDefault) {
      return {
        code: `export default () => 'An error occurred rendering ${id}: ${e.toString()}';`,
        map: null,
      }
    }
    return {
      code: null,
      map: null,
    }
  }

/**
 * Prepends the template root to the provided relative file path if it doesn’t already exist
 * @param {string} file
 * @param {string} root
 * @returns
 */
const normalizeFilePath = (file, root) => {
  if (typeof root === "undefined") {
    return file
  }

  return file.startsWith(root) || file.startsWith("/")
    ? file
    : root + "/" + file
}

const plugin = (options = {}) => {
  options = { ...defaultOptions, ...options }
  return {
    name: "vite-plugin-twig-craft",
    config: ({ root }) => {
      if (!options.root) {
        options.root = root
      }

      return {
        resolve: {
          alias: {
            "@twigVite": path.resolve(__dirname, "./"),
          },
        },
      }
    },
    async shouldTransformCachedModule(src, id) {
      return options.pattern.test(id)
    },
    async transform(src, id) {
      if (!options.pattern.test(id)) {
        return
      }

      let frameworkInclude = ""
      let frameworkTransform = "const frameworkTransform = (html) => html;"
      if (options.framework === FRAMEWORK_REACT) {
        frameworkInclude = `import React from 'react'`
        frameworkTransform = `const frameworkTransform = (html) => React.createElement('div', {dangerouslySetInnerHTML: {'__html': html}});;`
      }
      let embed,
        embeddedIncludes,
        code,
        includes,
        seen = []
      try {
        const result = await compileTemplate(id, id, options).catch(
          errorHandler(id)
        )
        if ("map" in result) {
          // An error occurred.
          return result
        }
        code = result.code
        includes = result.includes
        const includePromises = []
        const processIncludes = (template) => {
          const file = Twig.path.expandNamespace(
            options.namespaces,
            normalizeFilePath(template, options.root)
          )
          if (!seen.includes(file)) {
            // Prepare this include if we haven’t already
            includePromises.push(
              new Promise(async (resolve, reject) => {
                const { includes, code } = await compileTemplate(
                  template,
                  file,
                  options
                ).catch(errorHandler(template, false))
                if (includes) {
                  includes.forEach(processIncludes)
                }
                resolve(code)
              })
            )
            seen.push(file)
          }
        }
        includes.forEach(processIncludes)
        embed = includes
          .filter((template) => template !== "_self")
          .map(
            (template) =>
              `import '${resolve(
                Twig.path.expandNamespace(
                  options.namespaces,
                  normalizeFilePath(template, options.root)
                )
              )}';`
          )
          .join("\n")
        const includeResult = await Promise.all(includePromises).catch(
          errorHandler(id)
        )
        if (!Array.isArray(includeResult) && "map" in includeResult) {
          // An error occurred.
          return includeResult
        }
        embeddedIncludes = includeResult.reverse().join("\n")
      } catch (e) {
        return errorHandler(id)(e)
      }
      const output = `
      import Twig, { twig } from 'twig';
      import { addCraftExtensions } from '@twigVite/extensions.js';
      import globalVars from '@twigVite/lib/globals.js';
      ${frameworkInclude}

      ${embed}

      addCraftExtensions(Twig);
      // Disable caching.
      Twig.cache(false);

      ${embeddedIncludes};
      ${frameworkTransform};
      export default (context = {}) => {
        const component = ${code}
        ${includes ? `component.options.allowInlineIncludes = true;` : ""}
        try {
          return frameworkTransform(component.render({ ...globalVars, ...context }));
        }
        catch (e) {
          return frameworkTransform('An error occurred rendering ${id}: ' + e.toString());
        }
      }`
      return {
        code: output,
        map: null,
        dependencies: seen,
      }
    },
  }
}

export default plugin

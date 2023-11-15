import Twig from "twig"
const { twig } = Twig
import { resolve } from "node:path"
import filters from './lib/filters.js';
import functions from './lib/functions.js';

const FRAMEWORK_REACT = "react"
const FRAMEWORK_HTML = "html"

const defaultOptions = {
  namespaces: {},
  filters: {},
  functions: {},
  framework: FRAMEWORK_HTML,
  pattern: /\.(twig)(\?.*)?$/,
}
Twig.cache(false)

const includeTokenTypes = [
  "Twig.logic.type.embed",
  "Twig.logic.type.include",
  "Twig.logic.type.extends",
  "Twig.logic.type.import",
]

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
          reject("Error compiling twig file")
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

Twig.cache(false)

const errorHandler =
  (id, isDefault = true) =>
  (e) => {
    if (isDefault) {
      return {
        code: `export default () => 'An error occurred whilst rendering ${id}: ${e.toString()}';`,
        map: null,
      }
    }
    return {
      code: null,
      map: null,
    }
  }

/**
 * Prepends the template root to the provided file path if it doesn’t already exist
 * @param {string} file
 * @param {string} root
 * @returns
 */
const normalizeFilePath = (file, root) => {
  return file.startsWith(root) ? file : (root + '/' + file);
}

const plugin = (options = {}) => {
  options = { ...defaultOptions, ...options }
  return {
    name: "vite-plugin-twig-craft",
    config: ({ root }) => {
      if (!options.root) {
        options.root = root
      }
    },
    async shouldTransformCachedModule(src, id) {
      return options.pattern.test(id)
    },
    async transform(src, id) {
      if (options.pattern.test(id)) {
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
            const file = Twig.path.expandNamespace(options.namespaces, normalizeFilePath(template, options.root))
            if (!seen.includes(file)) {
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
                  Twig.path.expandNamespace(options.namespaces, normalizeFilePath(template, options.root))
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
        import { addCraftExtensions } from 'vite-plugin-twig-craft';
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
            return frameworkTransform(component.render(context));
          }
          catch (e) {
            return frameworkTransform('An error occurred whilst rendering ${id}: ' + e.toString());
          }
        }`
        return {
          code: output,
          map: null,
          dependencies: seen,
        }
      }
    },
  }
}

/**
 * Adds all the extensions to the given Twig instance.
 *
 * @param {Twig} twigInstance
 *   The instance of Twig to modify.
 * @param {Object<string, ?string|Object<string, ?string>>} config
 *   The Drupal config to use.
 */
export function addCraftExtensions(twigInstance, config = {}) {
  filters.forEach((filterArguments) => {
    twigInstance.extendFilter(...filterArguments);
  });

  functions.forEach((functionArguments) => {
    twigInstance.extendFunction(...functionArguments);
  });
}

export default plugin

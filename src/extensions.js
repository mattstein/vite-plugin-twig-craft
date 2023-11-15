import filters from './filters/twig.js';
import functions from './functions/twig.js';

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

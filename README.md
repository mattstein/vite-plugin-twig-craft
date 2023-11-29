# Vite Plugin Twig Craft

Vite plugin for transforming Twig files into JavaScript functions for Storybook.

> [!WARNING]
> This is a casual fork that doesn’t fully support Craft Twig or have its own test suite. It’ll probably work fine, but beware [its limitations](#craft-twig-compatibility).

## Usage

This assumes you’ve already [set up a Storybook project using the `@storybook/html-vite` framework](https://storybook.js.org/docs/builders/vite).

### Configuring Storybook

1. Install `vite-plugin-twig-craft` as a project dependency.
2. Add the Twig plugin to Storybook’s Vite configuration, and optionally include an alias to your Twig template directory.

```ts
// .storybook/main.ts
import twig from "vite-plugin-twig-craft"
import { resolve } from "path"
import { mergeConfig } from "vite"
import type { StorybookConfig } from "@storybook/html-vite"

const config: StorybookConfig = {
  // ...
  viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        twig({
          root: resolve(__dirname, "../templates"),
        }),
      ],
      resolve: {
        alias: {
          "@templates": resolve(__dirname, "../templates"),
        },
      },
    })
  },
}

export default config
```

### Writing Stories

Import the `.twig` file you intend to document, and write a component story for it:

```js
// src/stories/Button.stories.js
import Button from "@templates/button.twig"

export default {
  title: "UI/Button",
  component: Button,
  argTypes: {
    style: {
      options: ["default", "reversed"],
      control: "inline-radio",
    },
    width: {
      options: ["default", "full"],
      control: "inline-radio",
    },
  },
}

export const Default = {
  args: {
    text: "Read More",
    url: "#foo",
    style: "default",
  },
}
```

## Backstory

### Who’s this for?

Anyone using Storybook with Vite and attempting to document “components” for a Craft CMS project.

Components get air quotes because there’s no standard convention for them like you’d have with a UI framework such as Vue, React, or Svelte. I use the term to mean atomic and re-usable templates that concern themselves with presentation logic. In other words, taking simple inputs and generating markup.

### Why this project?

Documenting Twig components, and specifically Craft CMS Twig components, with Vite and Storybook is a pain.

Two reasons:

1. **Twig has fewer good Vite options compared to webpack.**  
   While webpack loader works pretty well, I started the Vite adventure with [`vite-plugin-twig-loader`](https://www.npmjs.com/package/vite-plugin-twig-loader) and every plugin I tried caused problems with Storybook in the browser once [includes got involved](https://github.com/twigjs/twig.js/issues/808).
2. **Twig is a PHP library and Storybook is built with JavaScript.**  
   Twig templates are interpreted for Storybook by a JavaScript Twig implementation called [Twig.js](https://github.com/twigjs/twig.js). The good news is that Twig.js maintains close feature parity with PHP Twig, and the bad news is that as a result you can’t use any Craft-specific Twig in templates you’re documenting with Storybook.

This Vite plugin was forked from [larowlan/vite-plugin-twig-drupal](https://github.com/larowlan/vite-plugin-twig-drupal), which solved the problem of collecting and preparing includes so they could work in the browser. So it first makes vanilla Twig possible thanks to [Lee Rowlands](https://github.com/larowlan)’ work.

It also replaces Drupal-specific Twig extensions with some for Craft CMS—meaning partial support for Craft-specific Twig in your Storybook stories.

### What else could you use?

1. Storybook with webpack, and [twigjs-loader](https://github.com/megahertz/twigjs-loader).
2. Storybook server, which could send story parameters to a Craft CMS controller that returns HTML. (I’ve not seen anyone doing this, and it requires a Craft instance to always be running and security consideration!)
3. Another Vite + Twig loader like the Drupal one I forked, but without any Craft-specific Twig.
4. Some other webpack loader or Vite plugin that relies on [Twing](https://gitlab.com/nightlycommit/twing) instead of Twig.js.

## Craft Twig Compatibility

You’ll probably want to look at the [Twig.js implementation notes](https://github.com/twigjs/twig.js/wiki/Implementation-Notes) to see exactly what it supports to start with.

The sections below document what Craft-specific Twig this package supports—which is still a narrow subset with caveats.

### Globals

Supported [Craft CMS Twig Globals](https://craftcms.com/docs/4.x/dev/global-variables.html).

| Filter         | Supported? | Notes                                                        |
| -------------- | ---------- | ------------------------------------------------------------ |
| \_globals      | 🚫         |                                                              |
| craft          | 🚫         |                                                              |
| currentSite    | 🚫         |                                                              |
| currentUser    | 🚫         |                                                              |
| devMode        | ✅         | Always `false`.                                              |
| loginUrl       | 🚫         |                                                              |
| logoutUrl      | 🚫         |                                                              |
| now            | ✅         |                                                              |
| setPasswordUrl | 🚫         |                                                              |
| siteName       | ✅         | Always `'My Site'`.                                          |
| siteUrl        | ✅         | Always `'https://mysite.foo/'`, with optional path appended. |
| systemName     | 🚫         |                                                              |
| today          | 🚫         |                                                              |
| tomorrow       | 🚫         |                                                              |
| view           | 🚫         |                                                              |
| yesterday      | 🚫         |                                                              |

### Filters

Supported [Craft CMS Twig Filters](https://craftcms.com/docs/4.x/dev/filters.html).

| Filter              | Supported? | Notes |
| ------------------- | ---------- | ----- |
| address             | 🚫         |       |
| append              | 🚫         |       |
| ascii               | 🚫         |       |
| atom                | 🚫         |       |
| attr                | 🚫         |       |
| base64_decode       | 🚫         |       |
| base64_encode       | 🚫         |       |
| boolean             | 🚫         |       |
| camel               | ✅         |       |
| column              | 🚫         |       |
| contains            | ✅         |       |
| currency            | 🚫         |       |
| date                | 🚫         |       |
| datetime            | 🚫         |       |
| diff                | 🚫         |       |
| duration            | 🚫         |       |
| encenc              | 🚫         |       |
| explodeClass        | 🚫         |       |
| explodeStyle        | 🚫         |       |
| filesize            | 🚫         |       |
| filter              | 🚫         |       |
| float               | ✅         |       |
| group               | 🚫         |       |
| hash                | 🚫         |       |
| httpdate            | 🚫         |       |
| id                  | 🚫         |       |
| index               | 🚫         |       |
| indexOf             | 🚫         |       |
| integer             | ✅         |       |
| intersect           | ✅         |       |
| json_decode         | 🚫         |       |
| json_encode         | 🚫         |       |
| kebab               | ✅         |       |
| lcfirst             | ✅         |       |
| length              | 🚫         |       |
| literal             | 🚫         |       |
| markdown            | ✅         |       |
| merge               | 🚫         |       |
| money               | 🚫         |       |
| multisort           | 🚫         |       |
| namespace           | 🚫         |       |
| namespaceAttributes | 🚫         |       |
| namespaceInputId    | 🚫         |       |
| namespaceInputName  | 🚫         |       |
| number              | 🚫         |       |
| parseAttr           | 🚫         |       |
| parseRefs           | 🚫         |       |
| pascal              | ✅         |       |
| percentage          | 🚫         |       |
| prepend             | 🚫         |       |
| purify              | 🚫         |       |
| push                | 🚫         |       |
| removeClass         | 🚫         |       |
| replace             | 🚫         |       |
| rss                 | 🚫         |       |
| snake               | ✅         |       |
| string              | 🚫         |       |
| time                | 🚫         |       |
| timestamp           | 🚫         |       |
| translate           | 🚫         |       |
| truncate            | 🚫         |       |
| ucfirst             | ✅         |       |
| unique              | ✅         |       |
| unshift             | 🚫         |       |
| ucwords             | ✅         |       |
| values              | ✅         |       |
| where               | 🚫         |       |
| widont              | ✅         |       |
| without             | 🚫         |       |
| withoutKey          | 🚫         |       |

### Functions

Supported [Craft CMS Twig Functions](https://craftcms.com/docs/4.x/dev/functions.html).

| Filter               | Supported? | Notes |
| -------------------- | ---------- | ----- |
| actionInput          | 🚫         |       |
| actionUrl            | 🚫         |       |
| alias                | 🚫         |       |
| attr                 | 🚫         |       |
| beginBody            | 🚫         |       |
| canCreateDrafts      | 🚫         |       |
| canDelete            | 🚫         |       |
| canDeleteForSite     | 🚫         |       |
| canDuplicate         | 🚫         |       |
| canSave              | 🚫         |       |
| canView              | 🚫         |       |
| ceil                 | ✅         |       |
| className            | 🚫         |       |
| clone                | 🚫         |       |
| collect              | ✅         |       |
| combine              | 🚫         |       |
| configure            | 🚫         |       |
| cpUrl                | 🚫         |       |
| create               | 🚫         |       |
| csrfInput            | 🚫         |       |
| dataUrl              | 🚫         |       |
| date                 | 🚫         |       |
| dump                 | 🚫         |       |
| endBody              | 🚫         |       |
| expression           | 🚫         |       |
| failMessageInput     | 🚫         |       |
| floor                | ✅         |       |
| getenv               | 🚫         |       |
| gql                  | 🚫         |       |
| head                 | 🚫         |       |
| hiddenInput          | ✅         |       |
| input                | ✅         |       |
| ol                   | ✅         |       |
| parseBooleanEnv      | 🚫         |       |
| parseEnv             | 🚫         |       |
| plugin               | 🚫         |       |
| raw                  | 🚫         |       |
| redirectInput        | 🚫         |       |
| renderObjectTemplate | 🚫         |       |
| seq                  | 🚫         |       |
| shuffle              | ✅         |       |
| siteUrl              | 🚫         |       |
| source               | 🚫         |       |
| successMessageInput  | 🚫         |       |
| svg                  | 🚫         |       |
| tag                  | ✅         |       |
| ul                   | ✅         |       |
| url                  | 🚫         |       |

### Tags

No [Craft CMS Twig Tags](https://craftcms.com/docs/4.x/dev/tags.html) are supported yet.

| Tag               | Supported? | Notes |
| ----------------- | ---------- | ----- |
| cache             | 🚫         |       |
| css               | 🚫         |       |
| dd                | 🚫         |       |
| dump              | 🚫         |       |
| exit              | 🚫         |       |
| header            | 🚫         |       |
| hook              | 🚫         |       |
| html              | 🚫         |       |
| js                | 🚫         |       |
| namespace         | 🚫         |       |
| nav               | 🚫         |       |
| paginate          | 🚫         |       |
| redirect          | 🚫         |       |
| requireAdmin      | 🚫         |       |
| requireEdition    | 🚫         |       |
| requireGuest      | 🚫         |       |
| requireLogin      | 🚫         |       |
| requirePermission | 🚫         |       |
| script            | 🚫         |       |
| switch            | 🚫         |       |
| tag               | 🚫         |       |

### Tests

Supported [Craft CMS Twig Tests](https://craftcms.com/docs/4.x/dev/tests.html).

| Test      | Supported? | Notes |
| --------- | ---------- | ----- |
| array     | 🚫         |       |
| boolean   | 🚫         |       |
| callable  | 🚫         |       |
| countable | 🚫         |       |
| float     | 🚫         |       |
| instance  | 🚫         |       |
| integer   | 🚫         |       |
| missing   | 🚫         |       |
| numeric   | 🚫         |       |
| object    | 🚫         |       |
| resource  | 🚫         |       |
| scalar    | 🚫         |       |
| string    | 🚫         |       |

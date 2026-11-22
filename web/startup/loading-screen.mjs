import { readFileSync } from 'node:fs'
import { URL } from 'node:url'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import postcss from 'postcss'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Button } from '@astryxdesign/core/Button'

// Render real Astryx components at build time. Neither React nor the full theme
// stylesheet needs to download before this surface can paint.
export function loadingScreen() {
  const markup = renderToStaticMarkup(
    h(
      'section',
      {
        id: 'app-startup',
        'data-astryx-theme': 'neutral',
        'aria-label': 'Beaver Money',
      },
      h(
        Stack,
        { gap: 4, align: 'center' },
        h(
          'section',
          { id: 'app-startup-indicator', 'aria-hidden': true },
          h(Spinner, { size: 'xl', shade: 'subtle' }),
        ),
        h(
          Heading,
          { level: 2, accessibilityLevel: 1, justify: 'center' },
          'Beaver Money',
        ),
        h(
          'section',
          { role: 'status', 'aria-live': 'polite' },
          h(
            Text,
            { id: 'app-startup-status', type: 'supporting', justify: 'center' },
            'Loading…',
          ),
        ),
        h(
          'section',
          { id: 'app-startup-retry', hidden: true },
          h(Button, { label: 'Reload', variant: 'secondary' }),
        ),
        h('noscript', null, 'Enable JavaScript to open Beaver Money.'),
      ),
    ),
  )
  const layout = readFileSync(
    new URL('./loading-screen.css', import.meta.url),
    'utf8',
  )
  const css = criticalStyles(markup, layout)
  return { markup, css }
}

function criticalStyles(markup, layout) {
  const document = new JSDOM(markup).window.document
  const root = postcss.parse(
    [
      '@astryxdesign/core/reset.css',
      '@astryxdesign/core/astryx.css',
      '@astryxdesign/theme-neutral/theme.css',
    ]
      .map((path) => readFileSync(new URL(import.meta.resolve(path)), 'utf8'))
      .join('\n'),
  )
  root.walkComments((comment) => comment.remove())
  root.walkAtRules('import', (rule) => rule.remove())
  root.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && rule.parent.name.endsWith('keyframes'))
      return
    // Keep interactive button states as well as the initial static render.
    const selectors = rule.selectors.filter((selector) => {
      const matchable = selector
        .replace(/::[\w-]+(?:\([^)]*\))?/g, '')
        .replace(/:(hover|active|focus-visible|focus|visited)\b/g, '')
      try {
        return document.querySelector(matchable) !== null
      } catch {
        return false
      }
    })
    if (!selectors.length) rule.remove()
    else
      rule.selectors = selectors.map((selector) =>
        selector.replace(/:root/g, '#app-startup'),
      )
  })
  // Retain only the tokens referenced by the selected components, recursively.
  const used = new Set()
  const collect = (value) => {
    for (const match of value.matchAll(/var\((--[\w-]+)/g)) used.add(match[1])
  }
  collect(layout)
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) collect(decl.value)
  })
  let size
  do {
    size = used.size
    root.walkDecls((decl) => {
      if (used.has(decl.prop)) collect(decl.value)
    })
  } while (size !== used.size)
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--') && !used.has(decl.prop)) decl.remove()
  })
  const animations = new Set()
  root.walkDecls('animation-name', (decl) => animations.add(decl.value))
  root.walkAtRules((rule) => {
    if (rule.name.endsWith('keyframes') && !animations.has(rule.params))
      rule.remove()
    if (rule.name === 'property' && !used.has(rule.params)) rule.remove()
  })
  // Empty containers may be nested inside layers and media/scope queries.
  for (let pass = 0; pass < 4; pass++)
    root.walk((node) => {
      if (node.nodes && !node.nodes.length) node.remove()
    })
  root.walk((node) => {
    node.raws.before = ''
    node.raws.after = ''
    if ('between' in node.raws)
      node.raws.between = node.type === 'decl' ? ':' : ''
  })
  root.walkAtRules('scope', (rule) => {
    rule.params = rule.params.replace(
      '[data-astryx-theme="neutral"]',
      '#app-startup[data-astryx-theme="neutral"]',
    )
  })
  root.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && rule.parent.name.endsWith('keyframes'))
      return
    rule.selectors = rule.selectors.map((selector) =>
      selector.includes('#app-startup') || selector.includes(':scope')
        ? selector
        : `:where(#app-startup) ${selector}`,
    )
  })
  // Layer order is global even when every selector is scoped. Establish the
  // application's complete order before Astryx's shorter layer declarations.
  const layerOrder = readFileSync(
    new URL('../src/styles.css', import.meta.url),
    'utf8',
  ).match(/@layer[^;]+;/)?.[0]
  if (!layerOrder) throw new Error('Application CSS layer order is missing')
  return `${layerOrder}\n${root.toString()}\n${layout}`
}

export function startupScreenPlugin() {
  return {
    name: 'astryx-startup-screen',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const { markup, css } = loadingScreen()
        return html
          .replace(
            '<!-- startup-style -->',
            `<style id="app-startup-style">${css}</style>`,
          )
          .replace('<!-- startup-screen -->', markup)
      },
    },
  }
}

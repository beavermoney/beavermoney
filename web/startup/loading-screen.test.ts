import { execFileSync } from 'node:child_process'
import { expect, it } from 'vitest'

it('builds a small Astryx loading surface with no external assets', () => {
  // Exercise the build-time Node entry, not Vite's browser URL rewriting.
  const { markup, css } = JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import {loadingScreen} from './startup/loading-screen.mjs'; console.log(JSON.stringify(loadingScreen()))",
      ],
      { encoding: 'utf8' },
    ),
  )
  expect(markup).toContain('astryx-spinner')
  expect(markup).toContain('astryx-heading')
  expect(markup).toContain('astryx-button')
  expect(markup).toContain('id="app-startup-status"')
  expect(markup).toContain('id="app-startup-retry" hidden')
  expect(markup).not.toMatch(/<(script|link|img)\b/)
  expect(css).not.toContain('@import')
  expect(css).toContain('@keyframes')
  expect(css).toContain('prefers-reduced-motion')
  expect(css).toContain('light-dark(')
  expect(css).toContain('--spacing-6:')
  expect(Buffer.byteLength(markup + css)).toBeLessThan(25000)
})

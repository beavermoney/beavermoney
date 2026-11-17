import { ESLint } from 'eslint'
import { expect, it } from 'vitest'
const eslint = new ESLint()
it.each([
  "import { useEffect } from 'react'",
  "import { useEffect as synchronize } from 'react'",
  "import { useLayoutEffect } from 'react'",
  "import { useInsertionEffect } from 'react'",
  "import React from 'react'; React.useEffect(() => {})",
  "import * as React from 'react'; React['useEffect'](() => {})",
  "import React from 'react'; const { useEffect: synchronize } = React",
])('rejects effect-hook access: %s', async (code) => {
  const [result] = await eslint.lintText(code, {
    filePath: 'src/effect-ban-example.tsx',
  })
  expect(
    result.messages.some((message) =>
      message.ruleId?.startsWith('no-restricted-'),
    ),
  ).toBe(true)
})
it('allows external-store subscriptions and event-driven state', async () => {
  const [result] = await eslint.lintText(
    "import { useSyncExternalStore, useState, useCallback } from 'react'",
    { filePath: 'src/effect-ban-example.tsx' },
  )
  expect(
    result.messages.some((message) =>
      message.ruleId?.startsWith('no-restricted-'),
    ),
  ).toBe(false)
})

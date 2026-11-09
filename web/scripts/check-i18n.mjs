import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const catalogs = ['en', 'zh-CN'].map(
  (locale) => `src/locales/${locale}/messages.po`,
)
const previous = catalogs.map((path) => readFileSync(path, 'utf8'))
const extract = spawnSync('pnpm', ['exec', 'lingui', 'extract', '--clean'], {
  stdio: 'inherit',
})
if (extract.status !== 0) process.exit(extract.status ?? 1)
if (
  catalogs.some((path, index) => readFileSync(path, 'utf8') !== previous[index])
) {
  console.error(
    'Translation catalogs were out of date. Review the extracted changes, translate new messages, and commit both PO files.',
  )
  process.exit(1)
}
const compile = spawnSync('pnpm', ['exec', 'lingui', 'compile', '--strict'], {
  stdio: 'inherit',
})
process.exit(compile.status ?? 1)

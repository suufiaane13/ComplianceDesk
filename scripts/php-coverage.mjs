/**
 * Génère backend/coverage.xml (Clover) pour SonarCloud.
 * Sur Windows XAMPP sans PCOV global : place php_pcov.dll dans tools/pcov/
 * (php_pcov-*-8.2-ts-vs16-x64.zip depuis pecl/windows).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backend = path.join(root, 'backend')
const dllCandidates = [
  path.join(root, 'tools', 'pcov', 'php_pcov.dll'),
  path.join(root, 'tools', 'pcov', 'php_pcov-1.0.12-8.2-ts-vs16-x64', 'php_pcov.dll'),
]
const dll = dllCandidates.find((p) => fs.existsSync(p))

const phpArgs = []
if (dll) {
  phpArgs.push(`-d`, `extension=${dll}`, `-d`, `pcov.enabled=1`)
}
phpArgs.push('vendor/bin/phpunit', '--coverage-clover=coverage.xml')

const result = spawnSync('php', phpArgs, {
  cwd: backend,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

const report = path.join(backend, 'coverage.xml')
if (!fs.existsSync(report)) {
  console.error('coverage.xml introuvable — activez PCOV ou Xdebug, puis relancez.')
  process.exit(1)
}
console.log(`OK: ${report}`)

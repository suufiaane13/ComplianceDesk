import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tokenFile = join(root, '.sonarcloud.token')

function loadToken() {
  if (process.env.SONAR_TOKEN?.trim()) {
    return process.env.SONAR_TOKEN.trim()
  }
  if (existsSync(tokenFile)) {
    const raw = readFileSync(tokenFile, 'utf8')
    const line = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith('#'))
    if (!line) return null
    return line.replace(/^SONAR_TOKEN\s*=\s*/i, '').replace(/^["']|["']$/g, '').trim()
  }
  return null
}

const token = loadToken()
if (!token) {
  console.error('')
  console.error('Token SonarCloud introuvable.')
  console.error('Cree le fichier .sonarcloud.token a la racine avec UNE ligne :')
  console.error('  ton_token_ici')
  console.error('(Ce fichier est ignore par git.)')
  console.error('')
  process.exit(1)
}

console.log('Analyse SonarCloud en cours...')
const result = spawnSync(
  'npx',
  [
    '--yes',
    'sonarqube-scanner',
    '-Dsonar.host.url=https://sonarcloud.io',
    `-Dsonar.token=${token}`,
  ],
  { cwd: root, stdio: 'inherit', shell: true },
)

process.exit(result.status ?? 1)

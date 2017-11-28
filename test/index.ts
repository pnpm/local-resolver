import test = require('tape')
import resolveFromLocal from '@pnpm/local-resolver'

test('resolveFromGit()', async t => {
  const resolveResult = await resolveFromLocal({pref: '..'}, {prefix: __dirname})
  t.equal(resolveResult!.id, 'file:..')
  t.equal(resolveResult!.normalizedPref, 'file:..')
  t.equal(resolveResult!['package'].name, '@pnpm/local-resolver')
  t.equal(resolveResult!.resolution!['directory'], '..')
  t.equal(resolveResult!.resolution!['type'], 'directory')
  t.end()
})

import test = require('tape')
import resolveFromLocal from '@pnpm/local-resolver'

test('resolve directoty', async t => {
  const resolveResult = await resolveFromLocal({pref: '..'}, {prefix: __dirname})
  t.equal(resolveResult!.id, 'file:..')
  t.equal(resolveResult!.normalizedPref, 'file:..')
  t.equal(resolveResult!['package'].name, '@pnpm/local-resolver')
  t.equal(resolveResult!.resolution!['directory'], '..')
  t.equal(resolveResult!.resolution!['type'], 'directory')
  t.end()
})

test('resolve file', async t => {
  const wantedDependency = {pref: './pnpm-local-resolver-0.1.1.tgz'}
  const resolveResult = await resolveFromLocal(wantedDependency, {prefix: __dirname})

  t.deepEqual(resolveResult, {
    id: 'file:pnpm-local-resolver-0.1.1.tgz',
    normalizedPref: 'file:pnpm-local-resolver-0.1.1.tgz',
    resolution: {
      integrity: 'sha512-UHd2zKRT/w70KKzFlj4qcT81A1Q0H7NM9uKxLzIZ/VZqJXzt5Hnnp2PYPb5Ezq/hAamoYKIn5g7fuv69kP258w==',
      tarball: 'file:pnpm-local-resolver-0.1.1.tgz',
    },
  })

  t.end()
})

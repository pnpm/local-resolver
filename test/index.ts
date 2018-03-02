import test = require('tape')
import resolveFromLocal from '@pnpm/local-resolver'

test('resolve directory', async t => {
  const resolveResult = await resolveFromLocal({pref: '..'}, {prefix: __dirname})
  t.equal(resolveResult!.id, 'file:..')
  t.equal(resolveResult!.normalizedPref, 'file:..')
  t.equal(resolveResult!['package'].name, '@pnpm/local-resolver')
  t.equal(resolveResult!.resolution!['directory'], '..')
  t.equal(resolveResult!.resolution!['type'], 'directory')
  t.end()
})

test('resolve directory specified using the file: protocol', async t => {
  const resolveResult = await resolveFromLocal({pref: 'file:..'}, {prefix: __dirname})
  t.equal(resolveResult!.id, 'file:..')
  t.equal(resolveResult!.normalizedPref, 'file:..')
  t.equal(resolveResult!['package'].name, '@pnpm/local-resolver')
  t.equal(resolveResult!.resolution!['directory'], '..')
  t.equal(resolveResult!.resolution!['type'], 'directory')
  t.end()
})

test('resolve directoty specified using the link: protocol', async t => {
  const resolveResult = await resolveFromLocal({pref: 'link:..'}, {prefix: __dirname})
  t.equal(resolveResult!.id, 'link:..')
  t.equal(resolveResult!.normalizedPref, 'link:..')
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

test('resolve tarball specified with file: protocol', async t => {
  const wantedDependency = {pref: 'file:./pnpm-local-resolver-0.1.1.tgz'}
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

test("fail when resolving tarball specified with the link: protocol", async t => {
  try {
    const wantedDependency = {pref: 'link:./pnpm-local-resolver-0.1.1.tgz'}
    const resolveResult = await resolveFromLocal(wantedDependency, {prefix: __dirname})
    t.fail()
  } catch (err) {
    t.ok(err)
    t.end()
  }
})

test('throw error when the path: protocol is used', async t => {
  try {
    await resolveFromLocal({pref: 'path:..'}, {prefix: __dirname})
    t.fail()
  } catch (err) {
    t.ok(err)
    t.equal(err.code, 'EUNSUPPORTEDPROTOCOL')
    t.equal(err.pref, 'path:..')
    t.equal(err.protocol, 'path:')
    t.end()
  }
})

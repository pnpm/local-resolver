import normalize = require('normalize-path')
import osenv = require('osenv')
import path = require('path')

// tslint:disable-next-line
const isWindows = process.platform === 'win32' || global['FAKE_WINDOWS']
const isFilespec = isWindows ? /^(?:[.]|~[/]|[/\\]|[a-zA-Z]:)/ : /^(?:[.]|~[/]|[/]|[a-zA-Z]:)/
const isFilename = /[.](?:tgz|tar.gz|tar)$/i
const isAbsolutePath = /^[/]|^[A-Za-z]:/

export interface LocalPackageSpec {
  dependencyPath: string,
  fetchSpec: string,
  id: string,
  type: 'directory' | 'file',
  normalizedPref: string,
}

export default function parsePref (
  pref: string,
  where: string,
): LocalPackageSpec | null {
  if (pref.startsWith('link:')) {
    return fromLocal(pref, where, 'directory')
  }
  if (pref.endsWith('.tgz')
    || pref.endsWith('.tar.gz')
    || pref.endsWith('.tar')
    || pref.includes(path.sep)
    || pref.startsWith('file:')
    || isFilespec.test(pref)) {
      const type = isFilename.test(pref) ? 'file' : 'directory'
      return fromLocal(pref, where, type)
    }
  if (pref.startsWith('path:')) {
    const err = new Error('Local dependencies via `path:` prefix are not supported. ' +
      'Use the `link:` prefix for folder dependencies and `file:` for local tarballs')
    // tslint:disable:no-string-literal
    err['code'] = 'INVALID_PREF'
    err['pref'] = pref
    // tslint:enable:no-string-literal
    throw err
  }
  return null
}

function fromLocal (pref: string, where: string, type: 'file' | 'directory'): LocalPackageSpec {
  if (!where) where = process.cwd()

  const spec = pref.replace(/\\/g, '/')
    .replace(/^(file|link):[/]*([A-Za-z]:)/, '$2') // drive name paths on windows
    .replace(/^(file|link):(?:[/]*([~./]))?/, '$2')

  // TODO: always use link: for directory dependencies
  const prefPrefix = pref.startsWith('link:') ? 'link:' : 'file:'
  let fetchSpec!: string
  let normalizedPref!: string
  if (/^~[/]/.test(spec)) {
    // this is needed for windows and for file:~/foo/bar
    fetchSpec = resolvePath(osenv.home(), spec.slice(2))
    normalizedPref = `${prefPrefix}${spec}`
  } else {
    fetchSpec = resolvePath(where, spec)
    if (isAbsolute(spec)) {
      normalizedPref = `${prefPrefix}${spec}`
    } else {
      normalizedPref = `${prefPrefix}${path.relative(where, fetchSpec)}`
    }
  }

  const dependencyPath = normalize(path.relative(where, fetchSpec))
  const id = `${prefPrefix}${dependencyPath}`

  return {
    dependencyPath,
    fetchSpec,
    id,
    normalizedPref,
    type,
  }
}

function resolvePath (where: string, spec: string) {
  if (isAbsolutePath.test(spec)) return spec
  return path.resolve(where, spec)
}

function isAbsolute (dir: string) {
  if (dir[0] === '/') return true
  if (/^[A-Za-z]:/.test(dir)) return true
  return false
}

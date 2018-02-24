import {PackageJson} from '@pnpm/types'
import fs = require('graceful-fs')
import normalize = require('normalize-path')
import path = require('path')
import readPackageJsonCB = require('read-package-json')
import ssri = require('ssri')
import promisify = require('util.promisify')
import parsePref from './parsePref'

const readPackageJson = promisify(readPackageJsonCB)

/**
 * Resolves a package hosted on the local filesystem
 */
export default async function resolveLocal (
  wantedDependency: {pref: string},
  opts: {prefix: string},
): Promise<{
  id: string,
  normalizedPref: string,
  resolution: {tarball: string},
} | {
  id: string,
  normalizedPref: string,
  package: PackageJson,
  resolution: {directory: string, type: 'directory'},
} | null> {
  const spec = parsePref(wantedDependency.pref, opts.prefix)
  if (!spec) return null

  const dependencyPath = normalize(path.relative(opts.prefix, spec.fetchSpec))
  const id = `file:${dependencyPath}`

  if (spec.type === 'file') {
    return {
      id,
      normalizedPref: spec.normalizedPref,
      resolution: {
        integrity: await getFileIntegrity(spec.fetchSpec),
        tarball: id,
      },
    }
  }

  const localPkg = await readPackageJson(path.join(spec.fetchSpec, 'package.json'))
  return {
    id,
    normalizedPref: spec.normalizedPref,
    package: localPkg,
    resolution: {
      directory: dependencyPath,
      type: 'directory',
    },
  }
}

async function getFileIntegrity (filename: string) {
  return (await ssri.fromStream(fs.createReadStream(filename))).toString()
}

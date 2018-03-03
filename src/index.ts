import {PackageJson} from '@pnpm/types'
import fs = require('graceful-fs')
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

  if (spec.type === 'file') {
    return {
      id: spec.id,
      normalizedPref: spec.normalizedPref,
      resolution: {
        integrity: await getFileIntegrity(spec.fetchSpec),
        tarball: spec.id,
      },
    }
  }

  let localPkg!: PackageJson
  try {
    localPkg = await readPackageJson(path.join(spec.fetchSpec, 'package.json'))
  } catch (internalErr) {
    switch (internalErr.code) {
      case 'ENOTDIR': {
        const err = new Error(`Could not install from "${spec.fetchSpec}" as it is not a directory.`)
        err['code'] = 'ENOTPKGDIR' // tslint:disable-line:no-string-literal
        throw err
      }
      case 'ENOENT': {
        const err = new Error(`Could not install from "${spec.fetchSpec}" as it does not contain a package.json file.`)
        err['code'] = 'ENOLOCAL' // tslint:disable-line:no-string-literal
        throw err
      }
      default: {
        throw internalErr
      }
    }
  }
  return {
    id: spec.id,
    normalizedPref: spec.normalizedPref,
    package: localPkg,
    resolution: {
      directory: spec.dependencyPath,
      type: 'directory',
    },
  }
}

async function getFileIntegrity (filename: string) {
  return (await ssri.fromStream(fs.createReadStream(filename))).toString()
}

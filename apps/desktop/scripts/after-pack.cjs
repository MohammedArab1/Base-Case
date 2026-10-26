/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const { execFileSync } = require('node:child_process')
const path = require('node:path')

/**
 * electron-builder leaves the Electron linker signature in place when
 * `identity: null` is used. macOS then reports the app as damaged. Apply a
 * local ad-hoc signature after packaging so the bundle is internally valid;
 * it is still unnotarized, so users must clear quarantine.
 */
module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') {
    return
  }

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)

  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit',
  })
  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath], {
    stdio: 'inherit',
  })
}

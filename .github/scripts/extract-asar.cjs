// Local fork: extract an asar archive with the @electron/asar copy the build already installed.
// Usage: node .github/scripts/extract-asar.cjs <archive> <destination>
'use strict'
const { createRequire } = require('node:module')
const { join } = require('node:path')

const [archive, destination] = process.argv.slice(2)
if (!archive || !destination) throw new Error('Usage: extract-asar.cjs <archive> <destination>')

const root = process.cwd()
// dsh-plugin-desktop declares @electron/asar directly; app-builder-lib (electron-builder) also depends on it.
const anchors = [
  () => createRequire(join(root, 'dsh-plugin-desktop', 'package.json')),
  () => createRequire(join(root, 'package.json')),
  () => createRequire(createRequire(join(root, 'dsh-desktop-next', 'package.json')).resolve('app-builder-lib/package.json')),
]

let asar
const failures = []
for (const anchor of anchors) {
  try { asar = anchor()('@electron/asar'); break } catch (error) { failures.push(error.message.split('\n')[0]) }
}
if (!asar) throw new Error(`@electron/asar not found:\n${failures.join('\n')}`)
asar.extractAll(archive, destination)
console.log(`Extracted ${archive} to ${destination}`)

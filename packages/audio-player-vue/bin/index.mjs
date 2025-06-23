#!/usr/bin/env node
import path from 'node:path'
import copyfiles from 'copyfiles'

const args = process.argv.slice(2)

const job = args[0]
if (!job || job !== 'export') {
  console.error('Usage: npx @mxwllstn/audio-player-vue export <abs-output-directory>')
  process.exit(1)
}
const output = args[1]
if (!output) {
  console.error('Usage: npx @mxwllstn/audio-player-vue export <abs-output-directory>')
  process.exit(1)
}

const inputPaths = ['*/**', '*']
const outputPath = path.join(output, '/audio-player-vue')
const options = { exclude: ['dist/**', 'bin/**'] }

copyfiles([...inputPaths, outputPath], options, () => {
  console.log(`exported to ${outputPath}`)
  process.exit(0)
})

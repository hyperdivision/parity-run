#!/usr/bin/env node
const path = require('path')
const prettyMs = require('pretty-ms')
const Parity = require('parity-spawn')
const Nanoeth = require('nanoeth/ipc')
const args = require('minimist')(process.argv.slice(2), {
  boolean: ['sync'],
  string: ['chain'],
  default: {
    chain: 'foundation',
    sync: true
  }
})

// replace this with a postgresdb for real world stuff

const SCRIPT_PATH = path.resolve(process.cwd(), args._[0])
if (SCRIPT_PATH == null) {
  console.error('No script given')
  process.exit(1)
}
console.log(SCRIPT_PATH)

const script = require(SCRIPT_PATH)
const p = new Parity({
  parityExec: require('parity-binary'),
  ipc: true,
  ws: false,
  jsonrpc: false,
  chain: args.chain,
  basePath: './data',
  apis: ['eth', 'parity_pubsub'],
  logging: {
    rpc: 'trace'
  }
})
console.log(p.argv)

p.on('log', function (data) {
  console.log('[parity]', data)
})

start().catch(console.error)

async function start () {
  await p.started
  const eth = new Nanoeth(p.ipcPath)

  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  process.on('uncaughtException', stop)
  process.on('unhandledRejection', stop)

  await new Promise((resolve) => {
    if (args.sync === false) return resolve()
    const unlisten = eth.subscribe(eth.getBlockByNumber('latest'), function (block) {
      console.log(arguments)
      const timestamp = parseInt(block.timestamp, 16) * 1000
      const delta = Date.now() - timestamp
      console.log('[sync] delta:', prettyMs(delta))
      if (delta < 1000 * 60 * 2) {
        unlisten()
        resolve()
      }
    })
  })

  try {
    await script(eth)
  } finally {
    await stop()
  }

  async function stop () {
    console.log('[parity] Stopping')
    eth.end()
    p.kill()
    await p.stopped
    console.log('[parity] stopped')
  }
}

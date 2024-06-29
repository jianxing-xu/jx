#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * 配置
 * config: {
 *  repositoryUrl: 'xx'
 *  accessToken: 'github personal access token'
 * }
 *
 */
import os from 'node:os'
import fs from 'node:fs/promises'
import { Command } from 'commander'
import ini from 'ini'

const program = new Command('global config')
program.description('set some config for jxcli')

const HOME_DIR = os.homedir()
export const CONFIG_FILE = `${HOME_DIR}/.jxcliconfig`

export async function getConfig() {
  const configFile = await fs.readFile(CONFIG_FILE, 'utf-8')
  const config = ini.parse(configFile)
  return config as Record<string, string>
}

async function set(k: string, v: string) {
  const config = await getConfig()
  config[k] = v
  fs.writeFile(CONFIG_FILE, ini.stringify(config))
}

program.command('config').argument('<string>', 'key value of sepreator by =').action((str: string) => {
  console.log('HOME_DIR:', HOME_DIR)
  const kv = str.split('=')
  fs.open(CONFIG_FILE, 'r').then(() => {
    set(kv[0], kv[1])
  }).catch((e) => {
    if (e.code === 'ENOENT') {
      fs.writeFile(CONFIG_FILE, '').then(() => {
        set(kv[0], kv[1])
      })
    }
  })
})
program.parse()

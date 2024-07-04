#!/usr/bin/env node

/**
 * 配置
 * config: {
 *  repositoryUrl: 'xx'
 *  accessToken: 'github personal access token'
 * }
 *
 */
import os from 'node:os'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import type { Command } from 'commander'
import ini from 'ini'

const HOME_DIR = os.homedir()
export const CONFIG_FILE = `${HOME_DIR}/.jxcliconfig`
export type IConfig = {
  repoUrl: string
  accessToken: string
} & Record<string, any>
const VALID_KEYS = ['repoUrl', 'accessToken']

export function getConfig(): IConfig {
  const configFile = fs.readFileSync(CONFIG_FILE, 'utf-8')
  const config = ini.parse(configFile)
  return config as IConfig
}
async function set(k: (keyof IConfig) | string, v: string) {
  const config = getConfig()
  config[k] = v
  fs.writeFileSync(CONFIG_FILE, ini.stringify(config))
}

export class ConfigCommand {
  program: Command
  constructor(program: Command) {
    this.program = program
  }

  registerCommand() {
    this.program.command('config').argument('<string>', 'key value of sepreator by =').action((str: string) => {
      const kv = str.split('=')
      const [key, ...values] = kv
      if (!VALID_KEYS.includes(key)) {
        console.warn('invalid config key')
        return
      }
      fsp.open(CONFIG_FILE, 'r').then(() => {
        set(key, values.join('='))
      }).catch((e) => {
        if (e.code === 'ENOENT') {
          fsp.writeFile(CONFIG_FILE, '').then(() => {
            set(key, values.join('='))
          })
        }
      })
    })
  }
}

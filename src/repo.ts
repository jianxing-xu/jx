/* eslint-disable no-console */
/**
 * command: {
 *    get(path): boolean // 获取文件内容
 *    set(path, append: bool): boolean // 设置文件内容
 *    append(path): boolean // 追加文件内容
 *    list(path): string[] // 枚举文件列表
 * }
 */

import { Buffer } from 'node:buffer'
import { Octokit } from 'octokit'
import node_fetch from 'node-fetch'
import type { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getConfig } from './config'

export class Repo {
  program: Command
  octokit?: Octokit
  owner: string = ''
  repo: string = ''
  constructor(program: Command) {
    this.program = program
  }

  initRepo() {
    const config = getConfig()
    // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group
    const reg = /.+github.com:?\/(.+)\/(.+)\.git/
    const r = reg.exec(config.repoUrl)
    if (!r?.[1] || !r?.[2])
      throw new Error('get owner/repo err')
    this.owner = r[1]
    this.repo = r[2]
  }

  getOctokit(): Octokit {
    if (this.octokit)
      return this.octokit
    const conf = getConfig()
    if (!conf.repoUrl)
      throw new Error('repoUrl is not set, use `jxcli config repoUrl=xxxx` to set it.')
    if (!conf.accessToken)
      throw new Error('accessToken is not set, use `jxcli config accessToken=xxxx` to set it.')

    this.initRepo()

    this.octokit = new Octokit({
      request: { fetch: node_fetch },
      userAgent: 'cvn-conf/v0.0.1',
      auth: conf.accessToken,
    })
    return this.octokit
  }

  async handleGet(filePath: string) {
    const spin = ora('Fetching...').start()
    try {
      const oct = this.getOctokit()
      spin.color = 'gray'
      const { data } = await oct.rest.repos.getContent({
        mediaType: { format: 'raw' },
        owner: this.owner,
        repo: this.repo,
        path: filePath,
      })
      spin.clear().stop()
      console.log(chalk.green('============Successful============='))
      console.log(chalk.blueBright(data))
      console.log(chalk.green('==================================='))
    }
    catch (error) {
      console.log(chalk.redBright('Some Error: ', error))
    }
    finally {
      spin.clear().stop()
    }
  }

  async handleSet(filePath: string, content: string) {
    const spin = ora('Fetching...').start()
    try {
      const oct = this.getOctokit()
      const { owner, repo } = this
      await oct.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Update File: ${filePath} ${new Date()}`,
        content: Buffer.from(content).toString('base64'),
      })
      spin.stop().clear()
    }
    catch (error) {
      console.log('SOME ERROR:', error)
    }
    finally {
      spin.stop().clear()
    }
  }

  handleAppend(filePath: string, content: string) {
    console.log(filePath, content)
  }

  handleLs(path = '/') {
    console.log(path)
  }

  registerCommand() {
    const command = this.program.command('repo').description('some repo operation')
    command.argument('<arg1>', 'fileName or path')
    command.argument('[arg2]', 'file content', '')
    command.option('-g, --get', 'get a file content', false)
    command.option('-s, --set', 'set a file with content', false)
    command.option('-a, --append', 'append content of file', false)
    command.option('-l, --list', 'list all files of path', false)
    command.action((arg1, arg2) => {
      const opts = command.opts()
      const c = Object.values(opts).filter(Boolean).reduce((p, c) => p + c, 0)
      if (c !== 1)
        throw new Error('only use a option in [-g,-s,-a,-l]')
      if (opts.get)
        this.handleGet(arg1)
      if (opts.set)
        this.handleSet(arg1, arg2)
      if (opts.append)
        this.handleAppend(arg1, arg2)
      if (opts.list)
        this.handleLs(arg1)
    })
  }
}

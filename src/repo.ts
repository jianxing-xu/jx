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
import type { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import autocomplete from 'inquirer-autocomplete-standalone'
import { octoUtil } from './utils'

export class Repo {
  program: Command

  opts?: Record<string, any>
  constructor(program: Command) {
    this.program = program
  }

  async handleGet(filePath: string) {
    const spin = ora('Fetching...').start()
    try {
      const oct = octoUtil.getOctokit()
      spin.color = 'gray'
      const { data } = await oct.rest.repos.getContent({
        owner: octoUtil.owner,
        repo: octoUtil.repo,
        path: filePath,
      })
      spin.clear().stop()
      console.log(chalk.green('============Successful============='))
      // eslint-disable-next-line ts/ban-ts-comment
      /** @ts-expect-error */
      console.log(chalk.blueBright(Buffer.from(data.content, 'base64').toString('utf-8') || ''))
      console.log(chalk.green('==================================='))
      return data
    }
    catch (error) {
      console.log(chalk.redBright('Some Error: ', error))
    }
    finally {
      spin.clear().stop()
    }
  }

  async handleSet(filePath: string, content: string) {
    const spin = ora('Updating...').start()
    try {
      let sha = ''
      if (!this.opts?.newfile) {
        const data = await this.getFileObj(filePath)
        sha = data.sha
      }
      const oct = octoUtil.getOctokit()
      const { owner, repo } = octoUtil
      await oct.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `${this.opts?.newfile ? 'New' : 'Update'} File: ${filePath} ${new Date()}`,
        content: Buffer.from(content).toString('base64'),
        sha,
      })
      spin.stop().clear()
      console.log(chalk.green('Update Success!'))
    }
    catch (error) {
      console.log(chalk.redBright('SOME ERROR:', error))
    }
    finally {
      spin.stop().clear()
    }
  }

  async handleAppend(filePath: string, content: string) {
    const data = await this.getFileObj(filePath)
    if (data.type === 'file') {
      const newContent = data.content += content
      this.handleSet(filePath, newContent)
      return
    }
    console.log(chalk.red('not a file'))
  }

  async handleLs(path = '') {
    try {
      const options = await this.getDirFiles(path)
      const answer: any = await autocomplete({
        message: 'Choose file or dir or input to search...',
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        source: async (input) => {
          const qs = options?.filter(f => f.name.includes(input?.trim() || '')).map(it => ({
            ...it,
            name: `${it.type === 'dir' ? '📁' : '📄'} ${it.name}`,
            value: `${it.path}===${it.type}`,
            description: '',
          })) || []
          qs.unshift({
            name: '..',
            description: `return to ${qs[0]?.parentPath}`,
            value: `${qs[0]?.parentPath}===dir`,
            type: 'dir',
            path: qs[0]?.parentPath || '',
            parentPath: '',
          })
          return qs
        },
      })
      const [value, type] = answer.split('===')
      if (type === 'dir')
        this.handleLs(value)

      if (type === 'file')
        this.handleGet(value)
    }
    catch (error) {
      console.log(chalk.red('SOME_ERROR:', error))
    }
  }

  registerCommand() {
    const command = this.program.command('repo').description('some repo operation')
    command.argument('<arg1>', 'fileName or path')
    command.argument('[arg2]', 'file content', '')
    command.option('-g, --get', 'get a file content', false)
    command.option('-s, --set', 'set a file with content', false)
    command.option('-sn, --newfile', 'have a new file, bool', false)
    command.option('-a, --append', 'append content of file', false)
    command.option('-l, --list', 'list all files of path', false)
    command.action((arg1, arg2) => {
      const opts = command.opts()
      this.opts = opts
      const c = Object.values(opts).filter(Boolean).reduce((p, c) => p + c, 0)
      if (c !== 1)
        throw new Error('only use a option in [-g,-s,-sn,-a,-l]')
      if (opts.get)
        this.handleGet(arg1)
      if (opts.set || opts.newfile)
        this.handleSet(arg1, arg2)
      if (opts.append)
        this.handleAppend(arg1, arg2)
      if (opts.list)
        this.handleLs(arg1)
    })
  }

  async getFileObj(filePath: string) {
    const { data } = await octoUtil.getOctokit().rest.repos.getContent({
      owner: octoUtil.owner,
      repo: octoUtil.repo,
      path: filePath,
    })
    if ('sha' in data)
      return data
    throw new Error('File Sha Not Found')
  }

  getParentPath(path: string) {
    const items = path.split('/')
    const last = items[items.length - 1]
    if (last.includes('.')) {
      items.pop()
      items.pop()
      return items.join('/')
    }
    else {
      items.pop()
      return items.join('/')
    }
  }

  async getDirFiles(path = '') {
    const spin = this.getSpin().start()
    try {
      const { data } = await octoUtil.getOctokit().rest.repos.getContent({
        owner: octoUtil.owner,
        repo: octoUtil.repo,
        path,
      })
      if (Array.isArray(data)) {
        return data.map(it => ({
          name: it.name,
          type: it.type,
          path: it.path,
          parentPath: it.path ? this.getParentPath(it.path) : void 0,
        }))
      }
    }
    finally {
      spin.stop()
    }
  }

  getSpin() {
    return ora()
  }
}

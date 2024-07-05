import path from 'node:path'
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import type { Command } from 'commander'
import { $, fs } from 'zx'
import AdmZip from 'adm-zip'
import chalk from 'chalk'
import ora from 'ora'
import { moveContents, octoUtil } from './utils'

export class Starter {
  program: Command
  constructor(program: Command) {
    this.program = program
  }

  registerCommand() {
    const command = this.program.command('start')
    command.argument('<repo>', 'a github repo name with me')
    command.argument('[owner]', 'a github owner of repo')
    command.argument('[ref]', 'a branch or tag or CommitSHA', 'main')
    command.option('-a, --alias [alias]', 'after unziping repo alias')
    command.action((repo, owner, ref) => {
      const opts = command.opts()
      octoUtil.initRepo()
      const spin = ora().start('Downloading')
      octoUtil.getOctokit().rest.repos.downloadZipballArchive({
        owner: owner || octoUtil.owner,
        repo,
        ref,
      }).then((res) => {
        const downloadFileName = randomUUID()
        const localPath = path.join(path.resolve('./'), `${downloadFileName}.zip`)

        fs.writeFile(localPath, Buffer.from(res.data as ArrayBuffer), (_err) => {
          spin.succeed('Download Successful! Start Unzip..')
          spin.start(chalk.blue('Unziping...'))

          const zip = new AdmZip(localPath)
          zip.extractAllTo(path.join(path.resolve('./'), downloadFileName), true)

          const projectName = typeof opts.alias === 'string' ? opts.alias : repo
          // 从子目录中移动出来
          this.moveout(downloadFileName, projectName).then(() => {
            $`rm -rf ${localPath}`
            $`rm -rf ${downloadFileName}`
            spin.succeed(`Successful! Unzip to ${repo}.`)
          }).finally(() => {
            spin.stop()
          })
        })
      })
    })
  }

  async moveout(repo: string, projectName: string) {
    const res = await fs.readdir(path.join(path.resolve('./'), repo))
    const sourceDir = path.join(path.resolve('./'), repo, res[0])
    const targetDir = path.join(path.resolve('./'), projectName)
    await moveContents(sourceDir, targetDir)
  }
}

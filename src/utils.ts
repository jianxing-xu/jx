/* eslint-disable no-console */
import path from 'node:path'
import { Octokit } from 'octokit'
import node_fetch from 'node-fetch'
import { fs } from 'zx'
import { getConfig } from './config'

interface IOctUtil {
  octokit: Octokit | null
  owner: string
  repo: string
  getOctokit: () => Octokit
  initRepo: () => void
}

export const octoUtil: IOctUtil = {
  octokit: null,
  owner: '',
  repo: '',
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
  },
  initRepo() {
    const config = getConfig()
    // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group
    const reg = /.+github.com:?\/(.+)\/(.+)\.git/
    const r = reg.exec(config.repoUrl)
    if (!r?.[1] || !r?.[2])
      throw new Error('get owner/repo err')
    this.owner = r[1]
    this.repo = r[2]
  },
}
export async function moveContents(source: string, target: string) {
  try {
    // 确保目标目录存在，如果不存在则创建它
    await fs.ensureDir(target)

    // 读取源目录中的所有文件和子目录
    const items = await fs.readdir(source)

    // 遍历每个文件和子目录并移动它们
    for (const item of items) {
      const sourcePath = path.join(source, item)
      const targetPath = path.join(target, item)

      // 移动文件或子目录
      await fs.move(sourcePath, targetPath, { overwrite: true })
    }

    console.log(`All contents moved from ${source} to ${target}`)
  }
  catch (error) {
    console.error('Error moving contents:', error)
  }
}

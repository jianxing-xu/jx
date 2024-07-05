import { Command } from 'commander'
import { Repo } from './repo'
import { ConfigCommand } from './config'
import { Starter } from './starter'

const program = new Command()

const repo = new Repo(program)
const configCommand = new ConfigCommand(program)
const starterCommand = new Starter(program)
repo.registerCommand()
configCommand.registerCommand()
starterCommand.registerCommand()

program.parse()
// eslint-disable-next-line node/prefer-global/process
process.on('SIGINT', () => {
  // eslint-disable-next-line node/prefer-global/process
  process.exit()
})

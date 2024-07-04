import { Command } from 'commander'
import { Repo } from './repo'
import { ConfigCommand } from './config'

const program = new Command()

const repo = new Repo(program)
const configCommand = new ConfigCommand(program)
repo.registerCommand()
configCommand.registerCommand()

program.parse()

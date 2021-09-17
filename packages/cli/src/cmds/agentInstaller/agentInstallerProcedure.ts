import chalk from 'chalk';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import Yargs from 'yargs';

import { exists } from '../../utils';
import AgentInstaller from './agentInstaller';
import { AbortError, InstallError, ValidationError } from '../errors';
import { run } from './commandRunner';
import UI from '../userInteraction';

type AgentInstallerConstructor = new (path: string) => AgentInstaller;

export interface AgentInstallerOptions {
  readonly name: string;
  readonly documentation?: string;
  readonly installers?: readonly AgentInstallerConstructor[];
}

export default class AgentInstallerProcedure {
  readonly name: string;
  readonly documentation?: string;
  readonly installers: readonly AgentInstaller[];

  constructor(readonly options: AgentInstallerOptions, readonly path: string) {
    this.name = options.name;
    this.documentation = options.documentation;
    this.installers = (options?.installers || []).map(
      (constructor) => new constructor(path)
    );
  }

  async availableInstallers(): Promise<AgentInstaller[]> {
    const results = await Promise.all(
      this.installers.map(async (installer) => await installer.available())
    );

    return this.installers.filter((_, i) => results[i]);
  }

  async run(userSpecifiedInstaller?: string): Promise<AgentInstaller> {
    const availableInstallers = await this.availableInstallers();

    let installer: AgentInstaller | undefined;
    if (userSpecifiedInstaller) {
      installer = this.installers.find(
        (i) => i.name.toLowerCase() === userSpecifiedInstaller.toLowerCase()
      );
    }

    if (!installer) {
      let projectType = this.installers[0].name;
      if (this.installers.length > 1) {
        const { result } = await UI.prompt({
          type: 'list',
          name: 'result',
          message: `Select the type of ${this.name} project to install the AppMap agent to.`,
          default:
            availableInstallers.length > 0
              ? availableInstallers[0].name
              : undefined,
          choices: this.installers.map((i) => i.name),
        });

        projectType = result;
      }

      if (projectType) {
        installer = this.installers.find((i) => i.name === projectType);
      } else {
        installer = this.installers[0];
      }
    }

    if (!installer) {
      // This should branch should never occur
      throw new ValidationError(`Invalid selection`);
    }

    try {
      let writeAppMapYml = true;
      if (await exists(join(this.path, 'appmap.yml'))) {
        const USE_EXISTING = 'Use existing';
        const OVERWRITE = 'Overwrite';
        const ABORT = 'Abort';

        const { overwriteAppMapYml } = await UI.prompt({
          type: 'list',
          name: 'overwriteAppMapYml',
          message:
            'An appmap.yml configuration file already exists. How should the conflict be resolved?',
          choices: [USE_EXISTING, OVERWRITE, ABORT],
        });

        if (overwriteAppMapYml === ABORT) {
          Yargs.exit(0, new Error());
        }

        if (overwriteAppMapYml === USE_EXISTING) {
          writeAppMapYml = false;
        }
      }

      let env = {
        'Project type': installer.name,
        'Project directory': resolve(this.path),
      };

      if (installer.environment) {
        env = { ...env, ...(await installer.environment()) };
      }

      const { confirm } = await UI.prompt({
        type: 'confirm',
        name: 'confirm',
        message: [
          `AppMap is about to be installed. Confirm the details below.`,
          Object.entries(env).map(
            ([key, value]) => `  ${chalk.blue(key)}: ${value.trim()}`
          ),
          '',
          '  Is this correct?',
        ]
          .flat()
          .join('\n'),
      });

      if (!confirm) {
        UI.status = 'Aborting installation.';
        UI.error(
          [
            'Modify the installation environment as needed, and re-run the command.',
            `Use ${chalk.blue('--help')} for more information.`,
          ].join('\n')
        );
        throw new AbortError(
          'aborted while confirming installation environment'
        );
      }

      if (!availableInstallers.includes(installer)) {
        const projectPath = chalk.red(resolve(this.path));
        const { name, buildFile } = installer;
        const message = [
          `No ${chalk.red(
            name
          )} project was able to be located at ${projectPath}.`,
        ];

        if (installer.buildFile) {
          message.push(
            `${chalk.red(
              buildFile
            )} was expected to be found at this path, but none could be located.`,
            '',
            `Switch the current directory or specify a directory using the ${chalk.blue(
              '-d'
            )} or ${chalk.blue('--dir')} command line argument.`,
            `Use ${chalk.blue('--help')} for more information.`
          );
        }

        throw new ValidationError(message.join('\n'));
      }

      UI.status = 'Installing the AppMap agent...';

      await installer.installAgent();

      if (installer.verifyCommand) {
        const cmd = await installer.verifyCommand();
        await run(cmd);
      }

      if (writeAppMapYml) {
        const initCommand = await installer.initCommand();
        const { stdout } = await run(initCommand);
        const json = JSON.parse(stdout);

        await fs.writeFile(
          join(this.path, 'appmap.yml'),
          json.configuration.contents
        );
      }

      if (installer.validateAgentCommand) {
        UI.status = 'Validating the AppMap agent...';

        const cmd = await installer.validateAgentCommand();
        try {
          await run(cmd);
        } catch (e) {
          UI.error('Failed to validate the installation.');
          throw e;
        }
      }

      const successMessage = [
        chalk.green('Success! The AppMap agent has been installed.'),
      ];

      if (installer.postInstallMessage) {
        successMessage.push('', await installer.postInstallMessage(), '');
      }

      if (this.documentation) {
        successMessage.push(
          'For more information, visit',
          chalk.blue(this.documentation)
        );
      }

      UI.success(successMessage.join('\n'));

      return installer;
    } catch (e) {
      throw new InstallError(e, installer);
    }
  }
}

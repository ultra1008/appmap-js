import ConfigurationProvider from './configurationProvider';
import yaml from 'js-yaml';
import { promises as fs } from 'fs';
import { Script } from 'vm';
import Assertion from '../assertion';
import { AssertionConfig, Configuration } from 'src/types';

function populateAssertion(assertion: Assertion, config: AssertionConfig): void {
  if (config.include && config.include.length > 0) {
    assertion.include = config.include
      .map((fn) => new Script(fn))
      .map((script) => (event, appMap) => {
        return script.runInNewContext({ event, appMap, console });
      });
  }
  if (config.exclude && config.exclude.length > 0) {
    assertion.exclude = config.exclude
      .map((fn) => new Script(fn))
      .map((script) => (event, appMap) => script.runInNewContext({ event, appMap }));
  }
  if (config.description) {
    assertion.description = config.description;
  }
}

async function buildBuiltinAssertion(config: AssertionConfig): Promise<Assertion> {
  const { scanner, Options } = (await import(`../scanner/${config.id}`)).default;

  let options: any;
  if (Options) {
    options = new Options();
  } else {
    options = {};
  }
  if (config.properties) {
    Object.keys(config.properties).forEach((name) => {
      const value = config.properties![name];
      options[name] = value;
    });
  }

  const result = scanner(options);
  populateAssertion(result, config);
  return result;
}

export default class ConfigurationProviderYaml implements ConfigurationProvider {
  constructor(private readonly config: string | Configuration) {}

  static get filePatterns(): readonly RegExp[] {
    return [/^(.*)\.ya?ml$/];
  }

  async getConfig(): Promise<readonly Assertion[]> {
    let rawConfig: Configuration | undefined;
    if (typeof this.config === 'string') {
      const yamlConfig = await fs.readFile(this.config, 'utf-8');
      rawConfig = yaml.load(yamlConfig, {
        filename: this.config,
      }) as Configuration;
    } else {
      rawConfig = this.config;
    }
    return Promise.all(
      rawConfig.scanners.map(async (c: AssertionConfig) => buildBuiltinAssertion(c))
    );
  }
}

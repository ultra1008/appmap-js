import { join } from 'path';
import { verbose } from '../utils';

const { promises: fsp } = require('fs');
const { queue } = require('async');
const { glob } = require('glob');
const yaml = require('js-yaml');
const { parseHTTPServerRequests } = require('./util');
const Model = require('./model');

class OpenAPICommand {
  constructor(directory) {
    this.directory = directory;
  }

  async execute() {
    this.count = 0;
    this.model = new Model();
    const q = queue(this.collectAppMap.bind(this), 5);
    q.pause();
    const files = await new Promise((resolve, reject) => {
      glob(`${this.directory}/**/*.appmap.json`, (err, globFiles) => {
        if (err) {
          return reject(err);
        }
        return resolve(globFiles);
      });
    });
    files.forEach((f) => q.push(f));
    await new Promise((resolve, reject) => {
      q.drain(resolve);
      q.error(reject);
      q.resume();
    });
    return this.model.openapi();
  }

  async collectAppMap(file) {
    this.count += 1;
    parseHTTPServerRequests(JSON.parse(await fsp.readFile(file)), (e) =>
      this.model.addRequest(e)
    );
  }
}

async function loadTemplate(fileName) {
  if (!fileName) {
    // eslint-disable-next-line no-param-reassign
    fileName = join(__dirname, '../../resources/openapi-template.yaml');
  }
  return yaml.load((await fsp.readFile(fileName)).toString());
}

module.exports = {
  command: 'openapi',
  aliases: ['swagger'],
  describe: 'Generate OpenAPI from AppMaps in a directory',
  builder(args) {
    args.option('appmap-dir', {
      describe: 'directory to recursively inspect for AppMaps',
      default: 'tmp/appmap',
    });
    args.option('output-file', {
      alias: ['o'],
      describe: 'output file name',
    });
    args.option('openapi-template', {
      describe:
        'template YAML; generated content will be placed in the paths and components sections',
    });
    args.option('openapi-title', {
      describe: 'info/title field of the OpenAPI document',
    });
    args.option('openapi-version', {
      describe: 'info/version field of the OpenAPI document',
    });
    args.option('openapi-default-host', {
      describe:
        'servers[0]/variables/defaultHost/default field of the OpenAPI document',
    });
    return args.strict();
  },
  async handler(argv) {
    verbose(argv.verbose);
    const { openapiTitle, openapiVersion, openapiDefaultHost } = argv;

    function tryConfigure(path, fn) {
      try {
        fn();
      } catch {
        console.warn(`Warning: unable to configure OpenAPI field ${path}`);
      }
    }

    const openapi = await new OpenAPICommand(argv.appmapDir).execute();

    const template = await loadTemplate(argv.openapiTemplate);
    template.paths = openapi.paths;
    template.components = openapi.components;
    if (openapiTitle) {
      tryConfigure('info.title', () => {
        template.info.title = openapiTitle;
      });
    }
    if (openapiVersion) {
      tryConfigure('info.version', () => {
        template.info.version = openapiVersion;
      });
    }
    if (openapiDefaultHost) {
      tryConfigure('servers[0].variables.defaultHost.default', () => {
        template.servers[0].variables.defaultHost.default = openapiDefaultHost;
      });
    }

    const yamlRepr = yaml.dump(template);
    if (argv.outputFile) {
      await fsp.writeFile(argv.outputFile, yamlRepr);
    } else {
      console.log(yamlRepr);
    }
  },
};

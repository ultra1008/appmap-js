import { glob } from 'glob';
import { dirname, join, relative } from 'path';
import { promisify } from 'util';
import { AppMapName } from './ChangeReport';
import { RevisionName } from './RevisionName';

export class Paths {
  constructor(public workingDir: string) {}

  async appmaps(revisionName: RevisionName): Promise<AppMapName[]> {
    const metadataPaths = await promisify(glob)(
      join(this.workingDir, revisionName, '**/metadata.json')
    );
    return metadataPaths.map((path) =>
      relative(join(this.workingDir, revisionName), dirname(path))
    );
  }

  manifestPath(revisionName: RevisionName): string {
    return join(this.revisionPath(revisionName), 'appmap_archive.json');
  }

  findingsPath(revisionName: RevisionName): string {
    return join(this.workingDir, revisionName, 'appmap-findings.json');
  }

  revisionPath(revisionName: RevisionName): string {
    return join(this.workingDir, revisionName);
  }

  openapiPath(revisionName: RevisionName): string {
    return join(this.workingDir, revisionName, 'openapi.yml');
  }

  appmapPath(revisionName: RevisionName, appmap: string) {
    return join(this.workingDir, revisionName, appmap);
  }

  metadataPath(revisionName: RevisionName, appmap: string): string {
    return join(this.workingDir, revisionName, appmap, 'metadata.json');
  }

  classMapPath(revisionName: RevisionName, appmap: string): string {
    return join(this.workingDir, revisionName, appmap, 'classMap.json');
  }

  sequenceDiagramPath(revisionName: RevisionName, appmap: string): string {
    return join(this.workingDir, revisionName, appmap, 'sequence.json');
  }

  sequenceDiagramDiffPath(appmap: string): string {
    return join(this.workingDir, RevisionName.Diff, [appmap, 'diff.sequence.json'].join('.'));
  }
}

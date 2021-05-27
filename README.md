# sfdx-mdt-plugin

[![Version](https://img.shields.io/npm/v/sfdx-mdt-plugin.svg)](https://npmjs.org/package/sfdx-mdt-plugin)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/Repositories/sfdx-mdt-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-mdt-plugin/branch/master)
[![Codecov](https://codecov.io/gh/Repositories/sfdx-mdt-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/Repositories/sfdx-mdt-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-mdt-plugin.svg)](https://npmjs.org/package/sfdx-mdt-plugin)
[![License](https://img.shields.io/npm/l/sfdx-mdt-plugin.svg)](https://github.com/Repositories/sfdx-mdt-plugin/blob/master/package.json)

<p align="center"><img src ="/assets/mdt.jpg" width="300"/></p>

<!-- toc -->
* [sfdx-mdt-plugin](#sfdx-mdt-plugin)
<!-- tocstop -->
  <!-- install -->
  <!-- usage -->
```sh-session
$ npm install -g sfdx-mdt-plugin
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-mdt-plugin/0.4.9 win32-x64 node-v12.14.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx mdt:changeset:retrieve -n <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtchangesetretrieve--n-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:customlabels:reorder -p <string> [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtcustomlabelsreorder--p-string--d-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:git:delta -f <string> -p <string> [-t <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtgitdelta--f-string--p-string--t-string--d-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:profile:adapt -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtprofileadapt--p-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:profile:reorder -p <string> [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtprofilereorder--p-string--d-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:profile:retrieve -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtprofileretrieve--p-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:translations:adapt -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdttranslationsadapt--p-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:translations:retrieve -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdttranslationsretrieve--p-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:workflow:activate -o <string> -r <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtworkflowactivate--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:workflow:deactivate -o <string> -r <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtworkflowdeactivate--o-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx mdt:changeset:retrieve -n <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:changeset:retrieve -n <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: force-app] The output
                                                                                    directory where to store the profile
                                                                                    metadata file

  -n, --changesetname=changesetname                                                 (required) The change set name

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:profile:retrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
     Retrieve a profile with all the accesses
```

_See code: [src/commands/mdt/changeset/retrieve.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/changeset/retrieve.ts)_

## `sfdx mdt:customlabels:reorder -p <string> [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:customlabels:reorder -p <string> [-d <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory that stores
                                                                                    metadata files

  -p, --sourcepath=sourcepath                                                       (required) The path to the source
                                                                                    metadata file

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:customlabels:reorder -p {sourcepath}
     Reorder Custom Labels xml file
```

_See code: [src/commands/mdt/customlabels/reorder.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/customlabels/reorder.ts)_

## `sfdx mdt:git:delta -f <string> -p <string> [-t <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:git:delta -f <string> -p <string> [-t <string>] [-d <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --descructivedir=descructivedir                                               The output directory where to
                                                                                    generate the destructive package

  -f, --from=from                                                                   (required) Branch or commit from

  -p, --packagedir=packagedir                                                       (required) The output directory
                                                                                    where to generate the package

  -t, --to=to                                                                       Branch or commit to

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:git:diff -f {fromCommit} [-t {toCommit}] -p {packagedirectory} [-d destructivedirectory]
     Generate a delta package based on a git diff
```

_See code: [src/commands/mdt/git/delta.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/git/delta.ts)_

## `sfdx mdt:profile:adapt -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:profile:adapt -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory where to store
                                                                                    the profile metadata file

  -p, --sourcepath=sourcepath                                                       (required) The path to the source
                                                                                    metadata file

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:profile:adapt -p {sourcepath} -d {outputdirectory}
       Adapt a profile to be deployed to an org
```

_See code: [src/commands/mdt/profile/adapt.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/profile/adapt.ts)_

## `sfdx mdt:profile:reorder -p <string> [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:profile:reorder -p <string> [-d <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory that stores
                                                                                    metadata files

  -p, --sourcepath=sourcepath                                                       (required) The path to the source
                                                                                    metadata file

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:profile:reorder -p {sourcepath} [-d {outputdirectory}]
     Reorder Profile xml file
```

_See code: [src/commands/mdt/profile/reorder.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/profile/reorder.ts)_

## `sfdx mdt:profile:retrieve -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:profile:retrieve -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory where to store
                                                                                    the profile metadata file

  -p, --sourcepath=sourcepath                                                       (required) The path to the source
                                                                                    metadata profile file

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:profile:retrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
     Retrieve a profile with all the accesses
```

_See code: [src/commands/mdt/profile/retrieve.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/profile/retrieve.ts)_

## `sfdx mdt:translations:adapt -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:translations:adapt -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory where to store
                                                                                    the translations metadata file

  -p, --sourcepath=sourcepath                                                       (required) The path to the source
                                                                                    metadata file

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:transalations:adapt -p {sourcepath} -d {outputdirectory}
       Adapt a transalations to be deployed to an org
```

_See code: [src/commands/mdt/translations/adapt.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/translations/adapt.ts)_

## `sfdx mdt:translations:retrieve -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:translations:retrieve -p <string> [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory where to store
                                                                                    the translations metadata file

  -p, --sourcepath=sourcepath                                                       (required) The path to the source
                                                                                    metadata translation file

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:translations:retrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
     Retrieve all translations related to a given language
```

_See code: [src/commands/mdt/translations/retrieve.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/translations/retrieve.ts)_

## `sfdx mdt:workflow:activate -o <string> -r <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:workflow:activate -o <string> -r <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -o, --objectname=objectname                                                       (required) The salesforce object
                                                                                    name

  -r, --rulename=rulename                                                           (required) The rule name

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:workflow:activate -u {sourceOrg} -o {object} -r {rulename}
     Activate a workflow rule
```

_See code: [src/commands/mdt/workflow/activate.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/workflow/activate.ts)_

## `sfdx mdt:workflow:deactivate -o <string> -r <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:workflow:deactivate -o <string> -r <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -o, --objectname=objectname                                                       (required) The salesforce object
                                                                                    name

  -r, --rulename=rulename                                                           (required) The rule name

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdt:workflow:deactivate -u {sourceOrg} -o {object} -r {rulename}
     Deactivate a workflow rule
```

_See code: [src/commands/mdt/workflow/deactivate.ts](https://github.com/benahm/sfdx-mdt-plugin/blob/v0.4.9/src/commands/mdt/workflow/deactivate.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->

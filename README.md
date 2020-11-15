mdtutil
=======

Metadata Util

[![Version](https://img.shields.io/npm/v/mdtutil.svg)](https://npmjs.org/package/mdtutil)
[![CircleCI](https://circleci.com/gh/Repositories/mdtutil/tree/master.svg?style=shield)](https://circleci.com/gh/Repositories/mdtutil/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/Repositories/mdtutil?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/mdtutil/branch/master)
[![Codecov](https://codecov.io/gh/Repositories/mdtutil/branch/master/graph/badge.svg)](https://codecov.io/gh/Repositories/mdtutil)
[![Greenkeeper](https://badges.greenkeeper.io/Repositories/mdtutil.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/Repositories/mdtutil/badge.svg)](https://snyk.io/test/github/Repositories/mdtutil)
[![Downloads/week](https://img.shields.io/npm/dw/mdtutil.svg)](https://npmjs.org/package/mdtutil)
[![License](https://img.shields.io/npm/l/mdtutil.svg)](https://github.com/Repositories/mdtutil/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g mdtutil
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
mdtutil/0.0.0 win32-x64 node-v12.14.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx mdt:customlabels:compose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtcustomlabelscompose--p-string--d-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:customlabels:decompose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtcustomlabelsdecompose--p-string--d-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:profile:compose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtprofilecompose--p-string--d-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx mdt:profile:decompose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mdtprofiledecompose--p-string--d-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx mdt:customlabels:compose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:customlabels:compose [-p <string>] [-d <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --inputdir=inputdir                                                           The input directory that stores the
                                                                                    decomposed metadata files

  -p, --sourcepath=sourcepath                                                       The path to the source metadata file

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdtutil:customlabels:compose -p {sourcepath} -d {outputdirectory}
     Compose multiple custom label file into the Custom Label xml file in order to deploy
```

_See code: [lib\commands\mdt\customlabels\compose.js](https://github.com/Repositories/mdt/blob/v0.0.0/lib\commands\mdt\customlabels\compose.js)_

## `sfdx mdt:customlabels:decompose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:customlabels:decompose [-p <string>] [-d <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory to store the
                                                                                    decomposed metadata files

  -p, --sourcepath=sourcepath                                                       The path to the source metadata file

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdtutil:customlabels:decompose -p {sourcepath} -d {outputdirectory}
     Decompose Custom Labels xml file to multiple files in order to easily manage custom labels using git
```

_See code: [lib\commands\mdt\customlabels\decompose.js](https://github.com/Repositories/mdt/blob/v0.0.0/lib\commands\mdt\customlabels\decompose.js)_

## `sfdx mdt:profile:compose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:profile:compose [-p <string>] [-d <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --inputdir=inputdir                                                           The input directory that stores the
                                                                                    decomposed metadata files

  -p, --sourcepath=sourcepath                                                       The path to the source metadata file

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx mdtutil:profile:compose -p {sourcepath} -d {outputdirectory}
     Compose multiple custom label file into the Custom Label xml file in order to deploy
```

_See code: [lib\commands\mdt\profile\compose.js](https://github.com/Repositories/mdt/blob/v0.0.0/lib\commands\mdt\profile\compose.js)_

## `sfdx mdt:profile:decompose [-p <string>] [-d <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx mdt:profile:decompose [-p <string>] [-d <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         The output directory to store the
                                                                                    decomposed metadata files

  -p, --sourcepath=sourcepath                                                       The path to the source metadata file

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx mdtutil:profile:decompose -p {sourcepath} -d {outputdirectory}
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [lib\commands\mdt\profile\decompose.js](https://github.com/Repositories/mdt/blob/v0.0.0/lib\commands\mdt\profile\decompose.js)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!

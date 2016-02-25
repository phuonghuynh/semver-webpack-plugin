# semver-webpack-plugin
A webpack plugic to do [semver](http://semver.org)

## Features
- Bump up `version` using function `semver.inc` fields in json files, ex: `package.json`, `bower.json`
- Support command line `arguments` or `config`
- Enable/disable by `arguments`
- More comming...

## Dependencies
These dependencies should be installed via `npm`
- `semver` latest
- `command-line-args` latest

## Installation
```bash
npm install semver-webpack-plugin --save-dev
```

## Webpack example 
- webpack.config.js
``` javascript
var SemverWebpackPlugin = require('semver-webpack-plugin');

module.exports = {
  plugins: [
      new SemverWebpackPlugin({
        files: [path.resolve(__dirname, "package.json")]
      })
    ]
}
```

- Gruntfile.js
```javascript
  grunt.initConfig({
    webpack: {
      build: webpackConfig
    }
  });
```

- package.json
```json
{
  ...
  "scripts": {
    "build": "grunt build --semver-webpack-plugin-disable",
    "dev": "webpack-dev-server --progress --colors",
    "build-major": "grunt build --semver-webpack-plugin-inc-args=major",
    "build-minor": "grunt build --semver-webpack-plugin-inc-args=minor",
    "build-beta": "grunt build --semver-webpack-plugin-inc-args=prerelease,beta"
  },
  "devDependencies": {
    "clean-webpack-plugin": "latest",
    ...
  }
  ...
}
```

## Usage
### Webpack config
```javascript
new SemverWebpackPlugin({options})
```
`options` properties:
- `files`: list of input files, should are absolute paths
- `incArgs`: `arguments` will be passed to function `semver.inc()`, see [node-semver](https://github.com/npm/node-semver)


### Arguments
- `--semver-webpack-plugin-inc-args` arguments passed to function `semver.inc` (in `csv` format), ex: `webpack --semver-webpack-plugin-inc-args=prelease,beta`
- `--semver-webpack-plugin-disable` this is useful to `bumpup` version in sometime, see example section above for more info
  - `true` then the Plugin will not run
  - Default is `false`

## License
http://www.opensource.org/licenses/mit-license.php
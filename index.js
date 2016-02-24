var semver = require("semver");
var fs = require("fs");

var args = {};
try {
  args = require('command-line-args')([
    {name: 'semver-webpack-plugin-disable', type: Boolean, defaultValue: false}
  ]).parse();
}
catch (e) {}

function SemverWebpackPlugin(options) {
  // Configure your plugin with options...
  this.options = options || {};
  this.options.files = this.options.files || [];
}

SemverWebpackPlugin.prototype.apply = function (compiler) {
  if (args["semver-webpack-plugin-disable"]) {
    return;
  }

  var incParams = this.options.incParams || [];
  if (incParams.length > 2) {
    throw new Error("`incParams` must have one or two params");
  }

  var files = this.options.files;
  if (files.length === 0) {
    throw new Error("`files` must have at least one file");
  }

  var done = this.options.done;
  var outMap = new Map();

  files.forEach(function (file) {
    var f = require(file);
    if (incParams.length === 2) {//TODO refactor `inc` params
      f.version = semver.inc(f.version, incParams[0], incParams[1]);
    }
    else if (incParams.length === 1) {
      f.version = semver.inc(f.version, incParams[0]);
    }
    outMap.set(file, f);
    (typeof done === "function") && done(f);
  });

  compiler.plugin("emit", function (compilation, callback) {
    outMap.forEach((json, file) => {
      compilation.assets[file] = {
        source: function () {return JSON.stringify(json, null, 2);},
        size: function () {return fs.statSync(file).size; }
      };
    });
    callback();
  });
};

module.exports = SemverWebpackPlugin;
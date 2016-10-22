var semver = require("semver");
var fs = require("fs");
var cmdArgs = require('command-line-args');
var args = {};
try {
  args = cmdArgs([
    {name: 'semver-webpack-plugin-disable', type: Boolean, defaultValue: false},
    {name: 'semver-webpack-plugin-inc-args', type: String},
    {name: 'semver-webpack-plugin-files', type: String}
  ]);
}
catch (e) {}

function extractIncArgs(options) {
  var incArgs = args["semver-webpack-plugin-inc-args"];
  if (incArgs) {
    incArgs = incArgs.split(",");
  }
  incArgs = incArgs || options.incArgs || [];
  if (incArgs.length > 2) {
    throw new Error("`incArgs` must have one or two params");
  }
  return incArgs;
}

function SemverWebpackPlugin(options) {
  if (args["semver-webpack-plugin-disable"]) {
    return;
  }

  this.options = options || {};
  this.options.files = this.options.files || [];

  var incArgs = extractIncArgs(this.options);
  var files = this.options.files;
  if (files.length === 0) {
    throw new Error("`files` must have at least one file");
  }

  var done = this.options.done;
  var outMap = new Map();
  files.forEach(function (file) {
    var f = require(file);
    incArgs.unshift(f.version);
    f.version = semver.inc.apply(this, incArgs);
    outMap.set(file, f);
    fs.writeFileSync(file, JSON.stringify(f, null, 2));
    (typeof done === "function") && done(f);
  });

  this.outMap = outMap;
}

SemverWebpackPlugin.prototype.apply = function (compiler) {
  if (args["semver-webpack-plugin-disable"]) {
    return;
  }

  var outMap = this.outMap;
  compiler.plugin("emit", function (compilation, callback) {
    outMap.forEach((json, file) => {
      compilation.assets[file] = {
        source: function () {return new Buffer(JSON.stringify(json, null, 2));},
        size: function () {return Buffer.byteLength(this.source(), 'utf8'); }
      };
    });
    callback();
  });
};

module.exports = SemverWebpackPlugin;

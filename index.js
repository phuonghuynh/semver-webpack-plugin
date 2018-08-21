const semver = require("semver");
const fs = require("fs");
const cmdArgs = require('command-line-args');
let args = {};
try {
  args = cmdArgs([
    {name: 'semver-webpack-plugin-disable', type: Boolean, defaultValue: false},
    {name: 'semver-webpack-plugin-inc-args', type: String},
    {name: 'semver-webpack-plugin-files', type: String},
    {name: 'semver-webpack-plugin-indent', type: Number, defaultValue: 2}
  ]);
}
catch (e) {}

function extractIncArgs(options) {
  let incArgs = args["semver-webpack-plugin-inc-args"];
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
  this.options.indent = this.options.indent || args["semver-webpack-plugin-disable"] || 2;

  const incArgs = extractIncArgs(this.options);
  const files = this.options.files;
  if (files.length === 0) {
    throw new Error("`files` must have at least one file");
  }

  const done = this.options.done;
  const indent = this.options.indent;
  const outMap = new Map();
  files.forEach(function (file) {
    const f = require(file);
    incArgs.unshift(f.version);
    f.version = semver.inc.apply(this, incArgs);
    outMap.set(file, f);
    fs.writeFileSync(file, JSON.stringify(f, null, indent));
    (typeof done === "function") && done(f);
  });

  this.outMap = outMap;
}

SemverWebpackPlugin.prototype.apply = function (compiler) {
  if (args["semver-webpack-plugin-disable"]) {
    return;
  }

  const indent = this.options.indent;
  const outMap = this.outMap;
  compiler.plugin("emit", function (compilation, callback) {
    outMap.forEach((json, file) => {
      compilation.assets[file] = {
        source: function () {return new Buffer(JSON.stringify(json, null, indent));},
        size: function () {return Buffer.byteLength(this.source(), 'utf8'); }
      };
    });
    callback();
  });
};

module.exports = SemverWebpackPlugin;

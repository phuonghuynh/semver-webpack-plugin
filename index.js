var semver = require("semver@5.1.0");
var fs = require("fs");

function SemverWebpackPlugin(options) {
  // Configure your plugin with options...
  this.options = options || {};
  this.options.files = this.options.files || ["./package.json"];
}

SemverWebpackPlugin.prototype.apply = function (compiler) {
  var bump = this.options.bump;
  var files = this.options.files;
  var done = this.options.done;
  var outMap = new Map();

  files.forEach(function (file) {
    var f = require(file);
    switch (bump) {
      default:
        f.version = semver.inc(f.version, "prerelease", "beta");
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
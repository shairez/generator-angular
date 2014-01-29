'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');
var fs = require("fs");

var Generator = module.exports = function Generator() {
  yeoman.generators.NamedBase.apply(this, arguments);

  try {
    this.appname = require(path.join(process.cwd(), 'bower.json')).name;
  } catch (e) {
    this.appname = path.basename(process.cwd());
  }
  this.appname = this._.slugify(this._.humanize(this.appname));


    // TODO: Handle package names - seperate dot and turn into camelCase (preserve last module name in dir structure)


	if (typeof this.env.options.appPath === 'undefined') {
		try {
			this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
		} catch (e) {}
		this.env.options.appPath = this.env.options.appPath || 'src';
	}


	this.createFilePath= function(packagesString){
		var currentPath = process.cwd(),
			appPath = this.env.options.appPath,
			appPathStringLength = appPath.length,
			appPathIndex = currentPath.indexOf(appPath);

		if (appPathIndex === -1 ||
			(appPathIndex + appPathStringLength) === currentPath.length ){
			var filepath = packagesString.replace(/\./g, path.sep);
			return this._.dasherize(filepath);
		}else{

			var scriptsFolder = "scripts",
				indexToCutFrom = currentPath.indexOf(scriptsFolder) + scriptsFolder.length + 1;

			return currentPath.slice(indexToCutFrom, currentPath.length)
		}
	}

	this.createModuleName = function(pathString){
		var that = this;
		fs.readdir(pathString, function(err, files){
			if (!err){
				
				files.forEach(function(file){
					if (file.indexOf(".mdl.js") !== -1){
						//this.scriptAppName = 
						return;
					}
				});
			}else{
				console.log("error in reading directory", err);
			}
			var parentDir = pathString.slice(0, pathString.lastIndexOf(path.sep));
			console.log("parentDir", parentDir);
		//	that.createModuleName(parentDir);
		})
	}

    this.createClassifyNames = function (){
        var str = this.name;
        var lastIndex = str.lastIndexOf(".");
        var packages = str.substring(0, lastIndex);
	    this.componentFilePath = this.createFilePath(packages);
        this.classedComponentName = this._.classify(str.substring(lastIndex, str.length));
        this.classedName = packages + "." + this.classedComponentName;
//	    this.scriptAppName = this._.camelize(this.appname) + angularUtils.appName(this);
	    var filePath = "src"+path.sep+"scripts"+path.sep+packages.replace(/\./g, path.sep);
	    this.createModuleName(filePath);

	    console.log("this.scriptAppName", this.scriptAppName);
    }

  this.cameledName = this._.camelize(this.name);
  this.createClassifyNames();



  if (typeof this.env.options.testPath === 'undefined') {
    try {
      this.env.options.testPath = require(path.join(process.cwd(), 'bower.json')).testPath;
    } catch (e) {}
    this.env.options.testPath = this.env.options.testPath || 'test/spec';
  }

  this.env.options.coffee = this.options.coffee;
  if (typeof this.env.options.coffee === 'undefined') {
    this.option('coffee');

    // attempt to detect if user is using CS or not
    // if cml arg provided, use that; else look for the existence of cs
    if (!this.options.coffee &&
      this.expandFiles(path.join(this.env.options.appPath, '/scripts/**/*.coffee'), {}).length > 0) {
      this.options.coffee = true;
    }

    this.env.options.coffee = this.options.coffee;
  }

  if (typeof this.env.options.minsafe === 'undefined') {
    this.option('minsafe');
    this.env.options.minsafe = this.options.minsafe;
  }

  var sourceRoot = '/templates/javascript';
  this.scriptSuffix = '.js';
  this.typeSuffixes = {
      controller: "ctrl",
      service: "srv",
	  factory: "srv",
      directive: "drv",
      constant: "cnst",
      value: "val",
      template: "tpl",
      module: "mdl",
      test: "test"
  };

  if (this.env.options.coffee) {
    sourceRoot = '/templates/coffeescript';
    this.scriptSuffix = '.coffee';
  }

    this.env.options.minsafe = true;
  if (this.env.options.minsafe) {
    sourceRoot += '-min';
  }

  this.sourceRoot(path.join(__dirname, sourceRoot));
};

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.appTemplate = function (src, dest) {
  yeoman.generators.Base.prototype.template.apply(this, [
    src + this.scriptSuffix,
    path.join(this.env.options.appPath, dest) + this.scriptSuffix
  ]);
};

Generator.prototype.testTemplate = function (src, dest) {
  yeoman.generators.Base.prototype.template.apply(this, [
    src + this.scriptSuffix,
    path.join(this.env.options.appPath, dest) + this.scriptSuffix
  ]);
};

Generator.prototype.htmlTemplate = function (src, dest) {
  yeoman.generators.Base.prototype.template.apply(this, [
    src,
    path.join(this.env.options.appPath, dest)
  ]);
};

Generator.prototype.addScriptToIndex = function (script) {
  try {
    var appPath = this.env.options.appPath;
    var fullPath = path.join(appPath, 'index.html');
    angularUtils.rewriteFile({
      file: fullPath,
      needle: '<!-- endbuild -->',
      splicable: [
        '<script src="scripts/' + script.replace('\\', '/') + '.js"></script>'
      ]
    });
  } catch (e) {
    console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + script + '.js ' + 'not added.\n'.yellow);
  }
};

Generator.prototype.generateSourceAndTest = function (appTemplate, testTemplate, targetDirectory, skipAdd, componentType) {
  var typeSuffix = "";
  if (componentType){
      var chosenSuffix = this.typeSuffixes[componentType];
      if (chosenSuffix){
          typeSuffix = chosenSuffix;
      }
  }
  var filename = this.name.slice(this.name.lastIndexOf(".")+1, this.name.length);
	filename = this._.dasherize(filename);
	filename += "." + typeSuffix;

//  this.appTemplate(appTemplate, path.join('scripts', targetDirectory, filename));
  var testFilename = filename + "." + this.typeSuffixes['test'];
//  this.testTemplate(testTemplate, path.join('scripts', targetDirectory, testFilename));
//  if (!skipAdd) {
//    this.addScriptToIndex(path.join(targetDirectory, this.name));
//  }
};

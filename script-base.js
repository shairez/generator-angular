'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');
var fs = require("fs");

var scriptsFolder = "scripts";

var Generator = module.exports = function Generator() {
	yeoman.generators.NamedBase.apply(this, arguments);

	try {
		this.appname = require(path.join(process.cwd(), 'bower.json')).name;
	} catch (e) {
		this.appname = path.basename(process.cwd());
	}
	this.appname = this._.slugify(this._.humanize(this.appname));


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
		test: "test",
		mock: "mock"
	};

	// TODO: Handle package names - seperate dot and turn into camelCase (preserve last module name in dir structure)


	if (typeof this.env.options.appPath === 'undefined') {
		try {
			this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
		} catch (e) {
		}
		this.env.options.appPath = this.env.options.appPath || 'src';
	}


	this.createFilePath = function (packagesString) {
		var currentPath = process.cwd(),
			appPath = this.env.options.appPath,
			appPathStringLength = appPath.length,
			appPathIndex = currentPath.indexOf(appPath);

		if (appPathIndex === -1 ||
			(appPathIndex + appPathStringLength) === currentPath.length) {
			var filepath = packagesString.replace(/\./g, path.sep);
			return this._.dasherize(filepath);
		} else {

			var indexToCutFrom = currentPath.indexOf(scriptsFolder) + scriptsFolder.length + 1;

			return currentPath.slice(indexToCutFrom, currentPath.length)
		}
	}

	function nextFolderIsScripts(pathString) {
		var lastFolder = pathString.slice(pathString.lastIndexOf(path.sep) + 1, pathString.length);
		return (lastFolder == scriptsFolder );
	}

	function goDownAFolder(pathString) {
		return pathString.slice(0, pathString.lastIndexOf(path.sep));
	}

	function findModuleNameInDirectory(dirPath) {
		var moduleName;

		if (fs.existsSync(dirPath)) {
			var files = fs.readdirSync(dirPath);

			files.forEach(function (file) {
				if (file.indexOf(".mdl.js") !== -1) {
					var fullPath = dirPath + path.sep + file;
					var fileContent = fs.readFileSync(fullPath, 'utf8');
					var moduleNameExp = /angular\.module\s?\(\s?['"](.*)['"]/;
					moduleName = fileContent.match(moduleNameExp)[1];
				}
			});
		}
		return moduleName;
	}

	this.createModuleName = function (pathString) {

		if (pathString.length === 0) {
			return;
		}
		var exists = fs.existsSync(pathString);
		if (!exists) {
			if (nextFolderIsScripts(pathString)) return;
			this.createModuleName(goDownAFolder(pathString));

		} else {
			this.scriptAppName = findModuleNameInDirectory(pathString);

			if (this.scriptAppName || nextFolderIsScripts(pathString)) return;
			this.createModuleName(goDownAFolder(pathString));
		}
	}

	this.findAppModule = function () {
		var appModulePath = this.env.options.appPath + path.sep + scriptsFolder;
		return findModuleNameInDirectory(appModulePath);
	}

	this.createComponentPackagedName = function (nameParam) {
		var firstDotIndex = nameParam.indexOf(".");
		var lastDotIndex = nameParam.lastIndexOf(".");
		if (lastDotIndex === -1) {
			return this.appModuleName + "." + nameParam;
		}
		if (nameParam.substring(0, firstDotIndex) !== this.appModuleName) {
			return this.appModuleName + "." + nameParam;
		}
		return nameParam;
	}

	this.createComponentFilePath = function (componentPackagedName) {

		var firstDotIndex = componentPackagedName.indexOf(".");
		var packagesWithoutAppModule = componentPackagedName.substring(firstDotIndex + 1, componentPackagedName.length);
		var fullPath = packagesWithoutAppModule.replace(/\./g, path.sep);
		return this._.dasherize(fullPath);
	}

	this.getComponentModuleName = function (componentFileBaseDir) {
console.log("componentFileBaseDir", componentFileBaseDir);
		if (componentFileBaseDir.length === 0) {
			return;
		}
		if (!fs.existsSync(componentFileBaseDir)) {
			if (nextFolderIsScripts(componentFileBaseDir)) {
				return
			}
		} else {
			var moduleName = findModuleNameInDirectory(componentFileBaseDir);
			if (moduleName || nextFolderIsScripts(componentFileBaseDir)) {
				return moduleName;
			}
		}
		return this.getComponentModuleName(goDownAFolder(componentFileBaseDir));
	}

	this.getRelativeModuleName = function(componentFilePath){
		var currentPath = process.cwd(),
			appPath = this.env.options.appPath,
			pathPrefix = currentPath,
			lastDir = path.basename(currentPath),
			appAndScriptsFoldersIndex = currentPath.indexOf(path.join(appPath,scriptsFolder));

		if (appAndScriptsFoldersIndex === -1){

			if (lastDir !== scriptsFolder && lastDir !== appPath){
				pathPrefix = path.join(currentPath, appPath, scriptsFolder);

			}else if (lastDir !== scriptsFolder){
					pathPrefix = path.join(currentPath, scriptsFolder);
			}
		}
		var modulePath = path.join(pathPrefix, componentFilePath);

		return this.getComponentModuleName(path.dirname(modulePath));
	}

	this.createClassifyNames = function () {

		this.appModuleName = this.findAppModule();
		this.classedName = this.componentPackagedName = this.createComponentPackagedName(this.name);
//		console.log("this.componentPackagedName", this.componentPackagedName);

		this.componentFilePath = this.createComponentFilePath(this.componentPackagedName);

		// TODO: create a full path and remove scripts and src from the rest of the file creation methods (appTemplate etc)

//		console.log("this.componentFilePath", this.componentFilePath);

		this.scriptAppName = this.componentModuleName = this.getRelativeModuleName(this.componentFilePath);
		console.log("this.componentModuleName", this.componentModuleName);

//		this.createModuleName(filePath);
	}

	this.cameledName = this._.camelize(this.name);
	this.createClassifyNames();


	if (typeof this.env.options.testPath === 'undefined') {
		try {
			this.env.options.testPath = require(path.join(process.cwd(), 'bower.json')).testPath;
		} catch (e) {
		}
		this.env.options.testPath = this.env.options.testPath || 'test/spec';
	}

	this.env.options.coffee = this.options.coffee;
	if (typeof this.env.options.coffee === 'undefined') {
		this.option('coffee');

		// attempt to detect if user is using CS or not
		// if cml arg provided, use that; else look for the existence of cs
		if (!this.options.coffee &&
			this.expandFiles(path.join(this.env.options.appPath, '/' + scriptsFolder + '/**/*.coffee'), {}).length > 0) {
			this.options.coffee = true;
		}

		this.env.options.coffee = this.options.coffee;
	}

	if (typeof this.env.options.minsafe === 'undefined') {
		this.option('minsafe');
		this.env.options.minsafe = this.options.minsafe;
	}


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
				'<script src="' + scriptsFolder + '/' + script.replace('\\', '/') + '.js"></script>'
			]
		});
	} catch (e) {
		console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + script + '.js ' + 'not added.\n'.yellow);
	}
};

Generator.prototype.generateSourceAndTest = function (appTemplate, testTemplate, targetDirectory, skipAdd, componentType, mockTemplate) {
	var typeSuffix = "";
	if (componentType) {
		var chosenSuffix = this.typeSuffixes[componentType];
		if (chosenSuffix) {
			typeSuffix = chosenSuffix;
		}
	}
//	var filename = this.name.slice(this.name.lastIndexOf(".") + 1, this.name.length);
//	filename = this._.dasherize(filename);
	var filename = this.componentFilePath;
	filename += "." + typeSuffix;
	this.appTemplate(appTemplate, path.join(scriptsFolder, filename));
	var testFilename = filename + "." + this.typeSuffixes['test'];
//	this.testTemplate(testTemplate, path.join(scriptsFolder, targetDirectory, testFilename));
	if (mockTemplate) {
		var mockFilename = filename + "." + this.typeSuffixes['mock'];
//		this.appTemplate(mockTemplate, path.join(scriptsFolder, targetDirectory, mockFilename));
	}
//  if (!skipAdd) {
//    this.addScriptToIndex(path.join(targetDirectory, this.name));
//  }
};

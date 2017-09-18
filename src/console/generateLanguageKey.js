/** Generate keys for language files  */

var fs = require('fs-extra');
var _ = require('lodash');
var sha1 = require('sha1');
var http = require('http');
var async = require('async');

var DatabaseManager = require('../server/lib/DatabaseManager');
var UserModel = require('../server/Models/User');

var Utils = require('../server/lib/utils');
var init = require('../server/lib/init');
var Const = require('../server/lib/consts');

var path = require('path');

var glob = require("glob")

var srcTop = path.resolve(__dirname, "../../", "src/");

var keys = {};

function processFile(file,cb){
	
	/*
	{{l10n "Description"}}
	helpers.l10n("Name")
	self.l10n('invalid userid')
	this.l10n('Please input name.');
	Utils.l10n(' sent message. '),
	
	*/
	
	fs.readFile(file, 'utf8', function(err, contents) {
		
		var matches = contents.match(/l10n\("(.+?)"\)/gi);
		
		_.forEach(matches,function(matchedString){
			
			var strip = matchedString.match(/l10n\("(.+?)"\)/i);
			
			if(strip.length > 1)
				keys[strip[1]] = "";
			
		});

		var matches = contents.match(/l10n\('(.+?)'\)/gi);
		
		_.forEach(matches,function(matchedString){
			
			var strip = matchedString.match(/l10n\('(.+?)'\)/i);
			
			if(strip.length > 1)
				keys[strip[1]] = "";
			
		});
		
		var matches = contents.match(/\{\{l10n "(.+?)"\}\}/gi);
		
		_.forEach(matches,function(matchedString){
			
			var strip = matchedString.match(/\{\{l10n "(.+?)"\}\}/i);
			
			if(strip.length > 1)
				keys[strip[1]] = "";
			
		});

		var matches = contents.match(/\{\{l10n '(.+?)'\}\}/gi);
		
		_.forEach(matches,function(matchedString){
			
			var strip = matchedString.match(/\{\{l10n '(.+?)'\}\}/i);
			
			if(strip.length > 1)
				keys[strip[1]] = "";
			
		});
		
		cb();
	});
	
};

async.waterfall([
	function(done){
		
		glob(srcTop + "**/**/*.js", {}, function (er, files) {
			
		
			async.eachSeries(files,function(file,doneEach){
				
				processFile(file,function(){

					doneEach();
					
				});

			},function(){
				done();
			});
			
		})

	},
	function(done,result){
	
		glob(srcTop + "**/**/*.hbs", {}, function (er, files) {

			async.eachSeries(files,function(file,doneEach){
				
				processFile(file,function(){

					doneEach();
					
				});
				
			},function(){
				done();
			});
			
			
		})
		
	}
],function(){

	var jsonString = JSON.stringify(keys);
	
});




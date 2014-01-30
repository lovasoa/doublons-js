var path = require("path");
var walk = require("walk").walk;
var mimetypes = require("./mimetypes.json");

var config = {
	//If a word is used in more than 10% of all filenames, consider it as meaningless
	uselessrate : 0.1,
	//But if it appears only 3 times or less, consider it is still usefull
	uselessmin : 3,
	//Don't compare files that are inside the same directory
	notSameDir : true,
	//The distance below which to consider there is a collision
	threshold : 0.6,
	//Consider only files of these types.
	filetypes : ["video", "audio"]
};


//Word separator
var wordSep = /[\W_]+/;
function File (root, fileStats) {
	this.filepath = path.join(root, fileStats.name);
	this.filename = fileStats.name;
	this.dirname = root;
	this.stats = fileStats;
	var withoutext = this.filename.slice(0,this.filename.lastIndexOf("."));
	this.words = withoutext.toLowerCase().split(wordSep);
}

function analyze_dir (dir) {
	var worker = new Worker("doublons-compute-worker.js");
	worker.onmessage = function (e) {
		var data = e.data;
		switch (data.cmd) {
			case "update_progress":
				gui.update_progress(data.progress);
				break;
			case "set_statemsg":
				gui.set_statemsg(data.msg);
				break;
			case "collision_found":
				gui.init_display_collisions();
				gui.display_collision(data.files, data.dist);
				break;
			case "log":
				console.log(data.msg);
				break;
			default:
				console.log("Received unknown command from worker. This is a bug.");
				console.dir(e);
		}
	};

	worker.onerror = function(err) {
		console.log("error in worker: ");
		console.dir(err);
	}

	worker.postMessage({
		"cmd": "setConfig",
		"config" : config
	});

	var walker = walk(dir);
	walker.on("file", function(root, fileStats, next) {
		var ok = true;
		if (config.filetypes) {
			var extension = path.extname(fileStats.name).slice(1);
			var mimeType = (mimetypes[extension]||"").split("/")[0];
			ok = (config.filetypes.indexOf(mimeType) !== -1 );
		}
		if (ok) {
			var file = new File(root, fileStats);
			worker.postMessage({
				"cmd": "addFile",
				"fileObj" : file
			});
		}
		next();
	});
	walker.on("end", function(){
		worker.postMessage({"cmd": "processFiles"});
	});
}

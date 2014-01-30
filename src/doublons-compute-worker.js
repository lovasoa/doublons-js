var config = {};

//Word separator
var wordSep = /[\W_]+/;

var files = [],
	allwords = {};

function addFile (fileObj){
	set_state("Adding directory "+fileObj.dirname);
	files.push(fileObj);
	for(var i=0; i<fileObj.words.length; i++) {
		var word = fileObj.words[i];
		allwords[word] = (allwords[word]||0) + 1;
	}
}




function levenshtein(w1, w2, costs) {
	var line_i = [];
	if (costs === undefined) costs = [1,1,1]; //Cost of addition, deletion, replacement
	for(var k=0; k<=w1.length; k++) line_i.push(k);
	for (var i=1; i<=w2.length; i++) {
		var prev_line = line_i;
		var line_i = [i];
		for (var k=1; k<=w1.length; k++) {
			cost = (w1[k-1] == w2[i-1]) ? 0 : costs[2];
			line_i[k] = Math.min(line_i[k-1]+costs[0], prev_line[k]+costs[1], prev_line[k-1]+cost);
		}
	}
	return line_i[w1.length];
}

function compute_dist (seq) {
	//Estimate the distance between seq[0] and seq[1] with a number between 0 and 1
	//The elements of seq should be arrays, or of any type that allows key access
	return levenshtein(seq[0],seq[1],[1,1,2]) / Math.max(seq[0].length, seq[1].length);
}

function processFiles () {
	//Use a map for faster lookup
	var uselesswords = {};
	set_state("Listing meaningless words");
	for (word in allwords) {
		var occurences = allwords[word];
		if (occurences > config.uselessmin &&
			occurences/files.length > config.uselessrate) {
				uselesswords[word] = true;
		}
	}

	set_state("Removing meaningless words");
	for (var i=0; i < files.length; i++) {
		var file = files[i],
			words = file.words,
			newwords = [];
		for (var j=0; j<words.length; j++) {
			if (! (words[j] in uselesswords)) newwords.push(words[j]);
		}
		file.words = newwords;
	}

	set_state("Calculating the distances between each pair of files");
	var curfiles = [], //Current doublet of files
		numCompTot = (files.length-1)*(files.length-2)/2, //Number of comparisons to perform
		numComp = 0;

	for (var i=0; i<files.length; i++) {
		curfiles[0] = files[i];
		for (var j=0; j<i; j++) { //For every files that curfiles[0] has never been compared to
			curfiles[1] = files[j];
			if (curfiles[0].dirname == curfiles[1].dirname && config.notSameDir) {
				numCompTot --;
				continue;
			}
			numComp ++;
			var clearnames = [curfiles[0].words.join(" "), curfiles[1].words.join(" ")];
			update_progress(numComp/numCompTot);
			var dist = Math.min(
				compute_dist([curfiles[0].words, curfiles[1].words]),
				compute_dist(clearnames)
			);
			if (dist < config.threshold) {
				collision_found(curfiles, dist);
			}
		}
	}
	end();
}


function update_progress (progress) {
	self.postMessage({
		"cmd" : "update_progress",
		"progress" : progress,
	});
}
function set_state (msg) {
	self.postMessage({
		"cmd" : "set_statemsg",
		"msg" : msg,
	});
}
function collision_found (files, dist) {
	self.postMessage({
		"cmd" : "collision_found",
		"files" : files,
		"dist" : dist
	});
}
function log(msg) {
	self.postMessage({
		"cmd" : "log",
		"msg" : msg
	});
}
function end () {
	self.postMessage({
		"cmd" : "end"
	});
	self.close();
}

self.addEventListener("message", function (e) {
	var data = e.data;
	switch(data.cmd) {
		case "addFile": addFile(data.fileObj); break;
		case "processFiles": processFiles(); break;
		case "setConfig": config = data.config;break;
	}
});

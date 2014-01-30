var gui={};

(function() {
	var state = document.getElementById("state"),
		statemsg = document.getElementById("statemsg"),
		progress = document.getElementById("progress"),
		pickdir  = document.getElementById("pickdir"),
		table = document.getElementById("collisions_table").tBodies[0];

	pickdir.addEventListener("click", function(){
		var fc = document.createElement("input");
		fc.type = "file";
		fc.value = "";
		fc.nwdirectory = true;
		state.classList.remove("hidden");
		fc.onchange = function() {
			analyze_dir(fc.value);
		}
		fc.click();
	}, true);

	gui.update_progress = function(rate) {
		progress.value = rate;
	};
	gui.set_statemsg = function (msg) {
		statemsg.innerHTML = msg;
	};
	gui.analyze_authorized = function (auth) {
		pickdir.disabled = auth;
	};
	function readableSize (size) {
		if (size > 1e9) return ((size/1e8|0)/10) + " Gb";
		else if (size > 1e6) return ((size/1e5|0)/10) + " Mb";
		else if (size > 1e3) return ((size/1e2|0)/10) + " Kb";
		else return size+" bytes";
	}
	function insert_collision (idx, files, dist) {
		var row = table.insertRow(idx);
		row.dataset["dist"] = dist;
		for (var i=0; i<2; i++) {
			var cell = row.insertCell(i);
			var pathElem = document.createTextNode(files[i].dirname+"/");
			var fileNameElem = document.createElement("b");
			var sizeElem = document.createElement("i");
			fileNameElem.textContent = files[i].stats.name;
			sizeElem.textContent = readableSize(files[i].stats.size);
			cell.appendChild(pathElem);
			cell.appendChild(fileNameElem);
			cell.appendChild(sizeElem);
		}
		cell = row.insertCell(2);
		cell.textContent = dist;
	};
	gui.display_collision = function (files, dist) {
		for (var idx=0; idx < table.rows.length; idx++) { //May not be necessary to do a dichotomy
			if (table.rows[idx].dataset["dist"] >= dist) break;
		}
		insert_collision(idx, files, dist);
	};
	gui.init_display_collisions = function() {
		table.parentElement.classList.remove("hidden");
		table.innerHTML = "";
	};
	gui.all_collisions_displayed = function (ndoublets) {
		gui.set_statemsg(ndoublets + " collisions found");
		gui.update_progress(1);
	};
})();

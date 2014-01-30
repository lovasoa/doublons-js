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
	function insert_collision (idx, files, dist) {
		var row = table.insertRow(idx);
		row.dataset["dist"] = dist;
		for (var i=0; i<2; i++) {
			var cell = row.insertCell(i);
			var pathElem = document.createTextNode(files[i].dirname+"/");
			var fileNameElem = document.createElement("b");
			fileNameElem.textContent = files[i].stats.name;
			cell.appendChild(pathElem);
			cell.appendChild(fileNameElem);
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
		state.classList.add("hidden");
		table.parentElement.classList.remove("hidden");
	};
})();

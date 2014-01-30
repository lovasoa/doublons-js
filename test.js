var walk = require("./src/fsplus/walk").walk;

walk("/home/olojkine/Vidéos", function(file, stat, islast){
	console.log(file.slice(-100), stat, islast);
});

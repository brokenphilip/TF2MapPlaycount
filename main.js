const header = ["#", "Name", "Times played", "Time spent", "Time per match"];

let data = [];

// 0 - sort by name, A-Z (^)
// 1 - sort by times played, lower-higher (^)
// 2 - sort by time spent, lower-higher (^)
// 3 - sort by time per match, lower-higher (^)
// 4 - sort by name, Z-A (v)
// 5 - sort by times played, higher-lower (v)
// 6 - sort by time spent, higher-lower (v)
// 7 - sort by time per match, higher-lower (v)
let sort_mode = 0;

window.onload = function() {
	document.getElementById("input").addEventListener("change", handleFileSelect, false);
	
	let target = document.documentElement;
	let body = document.body;

	target.addEventListener('dragover', (e) => {
		e.preventDefault();
		body.classList.add('dragging');
		console.log("dragover");
		
		//e.stopPropagation();
	});

	target.addEventListener('dragleave', () => {
		body.classList.remove('dragging');
		console.log("dragleave");
		
		//e.stopPropagation();
	});

	target.addEventListener('drop', (e) => {
		e.preventDefault();
		body.classList.remove('dragging');
		console.log("drop");

		parse(e.dataTransfer.files[0]);
		
		//e.stopPropagation();
	});
    
};

function handleFileSelect(e) {
	parse(e.target.files[0]);
}

function handleDrop(e) {
	// Prevent default behavior (file opening)
	e.preventDefault();
	document.getElementById("dnd").classList.remove("dragging");
	
	parse(e.dataTransfer.files[0]);
}

function parse(file) {
	const reader = new FileReader();
	
	let name = file.name;
	if (name == "viewed.res") {
		reader.onload = handleViewed;
	}
	else if (name == "tf2_playerstats.dmx") {
		reader.onload = handlePlayerstats;
	}
	else {
		alert("Invalid file name. Make sure you are only uploading either 'viewed.res' or 'tf2_playerstats.dmx'.");
		return;
	}
	
	reader.readAsText(file);
}

function handleViewed(e) {
	console.log(e);
	document.getElementById('fileContent').textContent = e.target.result;
}

function handlePlayerstats(e) {
	console.log(e);
	document.getElementById('fileContent').textContent = e.target.result;
}

function handleDragOver(e) {
	e.preventDefault();
}

function handleDragEnter(e) {
	e.preventDefault();
	document.getElementById("dnd").classList.add("dragging");
}

function handleDragLeave(e) {
	e.preventDefault();
	document.getElementById("dnd").classList.remove("dragging");
}

function formatTable() {
	let sort_mode = 0;
	//data = [];
	
	data.push([1, "map1", 10, 60, 60/10]);
	data.push([2, "map2", 5, 25, 25/5]);

	let result = document.getElementById("result");
	
	// Can't set innerHTML directly, otherwise it will prematurely close the <ul> for us
	let content = "<hr><table><tr>";
	
	for (let i = 0; i < header.length; i++) {
		if (i == 0) {
			content += "<th>" + header[i] + "</th>";
		}
		
		else {
			content += "<th onclick='sort(" + (i - 1) + ")' >" + header[i] + "</th>";
		}
	}
	
	content += "</tr>";
	
	for (let i = 0; i < data.length; i++) {
		content += "<tr>";
		
		for (let j = 0; j < data[i].length; j++) {
			content += "<td>" + data[i][j] + "</td>";
		}
		
		content += "</tr>";
	}
	
	
	
	content += "</table>"
	result.innerHTML = content;
}

function sort(mode) {
	alert("Sorting with mode " + mode);
	sort_mode = mode;
	formatTable();
}

function resetData() {
	data = [];
	formatTable();
}
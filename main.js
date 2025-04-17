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

let viewedSent = false;
let playerstatsSent = false;
/*
function add_drop(elem_tag)
{
	var all = Array.prototype.slice.call(document.getElementsByTagName(elem_tag));
	
	all.forEach(function(elem)
	{
		elem.addEventListener("drop", (e) =>
		{
			e.preventDefault();
			parse(e.dataTransfer.files[0]);
		});
	});
}
*/
window.onload = function()
{
	document.getElementById("input").addEventListener("change", handleFileSelect, false);

	let target = document.documentElement;

	target.addEventListener("dragover", (e) =>
	{
		if (event.target === target)
		{
			e.preventDefault();
			target.classList.add("dragging");
		}
	});

	target.addEventListener("dragleave", () =>
	{
		target.classList.remove("dragging");
	});

	target.addEventListener("drop", (e) =>
	{
		e.preventDefault();
		target.classList.remove("dragging");
		
		for (let i = 0; i < e.dataTransfer.files.length; i++)
		{
			parse(e.dataTransfer.files[i]);
		}
	});

	//add_drop("input");
	//add_drop("a");
};

function handleFileSelect(e)
{
	parse(e.target.files[0]);
}

function parse(file)
{
	const reader = new FileReader();
	
	let name = file.name;
	if (name == "viewed.res")
	{
		reader.onload = handleViewed;
	}
	else if (name == "tf2_playerstats.dmx")
	{
		reader.onload = handlePlayerstats;
	}
	else
	{
		alert("Invalid file name '" + name + "'. Make sure you are only uploading either 'viewed.res' or 'tf2_playerstats.dmx'.");
		return;
	}
	
	reader.readAsText(file);
}

function handleViewed(e)
{
	if (viewedSent)
	{
		alert("Processing failed - 'viewed.res' was already sent. Please reset your data first.");
		return;
	}
	
	let text = e.target.result;
	
	if (!text.startsWith("viewed.res", 1))
	{
		alert("Processing failed - 'viewed.res' appears to be malformed.");
		return;
	}
	
	let quotes = text.split("\"");
	for (let i = 3; i < quotes.length; i += 6)
	{
		addMapData(quotes[i], quotes[i + 4], "/");
	}
	
	viewedSent = true;
	document.getElementById("viewed").classList.add("attached");
	formatTable();
}

function handlePlayerstats(e)
{
	if (playerstatsSent)
	{
		alert("Processing failed - 'tf2_playerstats.dmx' was already sent. Please reset your data first.");
		return;
	}
	
	let text = e.target.result;
	
	if (!text.startsWith("dmx encoding keyvalues2 1 format dmx 1", 5))
	{
		alert("Processing failed - 'tf2_playerstats.dmx' appears to be malformed.");
		return;
	}
	
	let maps = text.split("\"MapStats_t\"");
	for (let map in maps)
	{
		// Skip garbage
		if (map == 0)
		{
			continue;
		}
		
		let quotes = maps[map].split("\"");
		let mapname = quotes[27];
		
		// Skip whatever this is
		if (mapname == "Missing")
		{
			continue;
		}
		
		addMapData(mapname, "/", quotes[21]);
	}
	
	playerstatsSent = true;
	document.getElementById("playerstats").classList.add("attached");
	formatTable();
}

function addMapData(name, times_played, time_spent)
{
	// Search for existing entries first
	for (let i in data)
	{
		let entry = data[i];
		
		if (entry[0] == name)
		{
			// We got a new value for 'Times played'
			if (times_played != "/" && entry[1] == "/")
			{
				entry[1] = times_played;
			}
			
			// We got a new value for 'Time spent'
			if (time_spent != "/" && entry[2] == "/")
			{
				entry[2] = time_spent;
			}
			
			// We have both 'Times played' and 'Time spent' for this map, calculate 'Time per match'
			if (entry[1] != "/" && entry[2] != "/")
			{
				entry[3] = parseFloat(entry[2]) / parseFloat(entry[1]);
			}
			
			return;
		}
	}
	
	// If not found, add our entry
	// This assumes the function never gets called with both times_played and time_spent (which is true)
	data.push([name, times_played, time_spent, "/"]);
}

function formatTable()
{
	let result = document.getElementById("result");
	
	// Can't set innerHTML directly, otherwise it will prematurely close tags for us
	let content = "<hr><table><tr>";
	
	for (let i = 0; i < header.length; i++)
	{
		if (i == 0)
		{
			content += "<th>" + header[i] + "</th>";
		}
		else
		{
			let arrow = " &nbsp;&nbsp; ";
			if (sort_mode == i - 1)
			{
				arrow = " &uarr; ";
			}
			else if (sort_mode == i + 3)
			{
				arrow = " &darr; ";
			}
			content += "<th onclick='sort(" + (i - 1) + ")' >" + arrow + header[i] + arrow + "</th>";
		}
	}
	
	let sorted = data.sort(function(a, b)
	{
		// Make sure unset values sink to the bottom
		if (a[sort_mode] == "/")
		{
			return (sort_mode < 4)? 1 : -1;
		}
		if (b[sort_mode] == "/")
		{
			return (sort_mode < 4)? -1 : 1;
		}

		switch (sort_mode)
		{
			case 0: return a[0].localeCompare(b[0]);
			case 1: return a[1] - b[1];
			case 2: return a[2] - b[2];
			case 3: return a[3] - b[3];
			case 4: return b[0].localeCompare(a[0]);
			case 5: return b[1] - a[1];
			case 6: return b[2] - a[2];
			case 7: return b[3] - a[3];
		}
	});
	
	content += "</tr>";
	
	for (let i = 0; i < sorted.length; i++)
	{
		content += "<tr>";
		
		content += "<td>" + (i+1) + "</td>";
		for (let j = 0; j < sorted[i].length; j++)
		{
			let val = sorted[i][j];
			
			// Format time-related columns
			if (j > 1 && val != "/")
			{
				let hours = Math.floor(val / 3600);
				val %= 3600;
				minutes = Math.floor(val / 60).toString().padStart(2, '0');
				seconds = Math.floor(val % 60).toString().padStart(2, '0');
				
				val = hours + ":" + minutes + ":" + seconds;
			}
			
			content += "<td>" + val + "</td>";
		}
		
		content += "</tr>";
	}
	
	content += "</table>"
	result.innerHTML = content;
	
	//add_drop("th");
}

function sort(mode)
{
	// Reverse the sort if we selected the same column
	if (sort_mode == mode)
	{
		sort_mode += 4;
		
		// Loop back if we went out of bounds
		sort_mode %= 8;
	}
	else
	{
		sort_mode = mode;
	}
	
	formatTable();
}

function resetData()
{
	data = [];
	document.getElementById("result").innerHTML = "";
	viewedSent = false;
	playerstatsSent = false;
	document.getElementById("viewed").classList.remove("attached");
	document.getElementById("playerstats").classList.remove("attached");
}
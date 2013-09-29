var main = function()
{
	var search_str = "/party/create/", pos = window.location.href.search(search_str);
	var partyname = window.location.href.substr(pos+search_str.length);
	WarpClient.createRoom(partyname, username, maxUsers, null);
}

var addSong = function(trackid)
{
	WarpClient.getLiveRoomInfo(roomID);
	this.gotRoomInfo = function(data)
	{
		data = data.customData;
		if(data)
		{
			data = JSON.parse(data);
			if(data["queue"])
			{
				if(trackid in data["queue"])
					data["queue"][trackid]++;
				else
				{
					var obj = {}; obj[trackid] = 1;
					data["queue"].push(obj);
				}
				WarpClient.setCustomRoomData(roomID, data);
			}	
			else
			{
				data["queue"] = [];
				var obj = {}; obj[trackid]=1;
				data["queue"].push(obj);
				data = JSON.stringify(data);
				WarpClient.setCustomRoomData(roomID, data);
			}
		}
		else
		{
			data = {};
			data["queue"] = [];
			var obj = {}; obj[trackid]=1;
			data["queue"].push(obj);
			data = JSON.stringify(data);
			WarpClient.setCustomRoomData(roomID, data);
		}

		// console.log(trackid, data);

	}
}

var removeSong = function(trackid)
{
	WarpClient.getLiveRoomInfo(roomID);
	this.gotRoomInfo = function(data)
	{
		data = data.customData;
		if(data)
		{
			data = JSON.parse(data);
			// console.log(data["queue"]);
			for(var i = 0; i < data["queue"].length; i++)
			{
				var song = data["queue"][i];
				if(trackid in song)
				{
					// console.log(song);
					data["queue"].splice(i, 1);
					console.log(data["queue"]);
					// delete data[trackid];
					if($.isEmptyObject(data))
						data = "";
					WarpClient.setCustomRoomData(roomID, data);
				}	
			}
		}
	}
}

var storeRoomID = function()
{
	$.post("/", data, function()
	{

	})
}
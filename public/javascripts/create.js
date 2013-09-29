var main = function()
{
	var search_str = "/party/create/", pos = window.location.href.search(search_str);
	var partyname = window.location.href.substr(pos+search_str.length);
	console.log(partyname, username, maxUsers);
	WarpClient.createRoom(partyname, username, maxUsers, null);
}

var addSong = function(trackid)
{
	WarpClient.getLiveRoomInfo(roomID);
	this.gotRoomInfo = function(data)
	{
		if(data)
		{
			data = JSON.parse(data);
			if(trackid in data)
				data[trackid]++;
			else
				data[trackid] = 1;
			WarpClient.setCustomRoomData(roomID, data);
		}	
		else
		{
			var add = {}; add[trackid] = 1;
			data = JSON.stringify(add);
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
		if(data)
		{
			data = JSON.parse(data);
			if(trackid in data)
			{
				delete data[trackid];
				if($.isEmptyObject(data))
					data = "";
				WarpClient.setCustomRoomData(roomID, data);
			}	
		}
	}
}

var setRoomData = function(event)
{
}
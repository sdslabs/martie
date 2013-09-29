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
			var data = JSON.parse(data);
		else
		{
			var add = {}; add[trackid] = 1;
			var data = JSON.stringify(add);
			WarpClient.setCustomRoomData(roomID, data);
		}
		// console.log(trackid, data);

	}
}

var gotRoomInfo = function(data)
{
	addSong.gotRoomInfo();
}

var setRoomData = function(event)
{
}
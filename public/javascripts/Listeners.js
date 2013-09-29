function MyConnectionRequestListener() {
	this.onConnectDone = function(result){
		if(result!=resultcode_success){
			console.log('connection lost due to inactivity. Refresh page and try again');
		}
		else
			WarpClient.joinZone(username);
	};
	
	this.onJoinZoneDone = function(result){
		if(result == resultcode_success){
			main();
			// WarpClient.joinLobby();
			// triggerEvents();
		}
	};
	
	this.onDisconnectDone = function(result){
		
	};	
}

function MyZoneRequestListener() {
	this.onCreateRoomDone = function(event){
		// $('#chatLog').append('<p>' + 'create room result ' +event.result + '</p>');
		roomID = event.roomdata.id;
		console.log("Created room", event);
		// createdRoom();
	};
	this.onDeleteRoomDone = function(event){
	};
	this.onGetAllRoomsDone = function(event){
		console.log(event);
		for(var i=0; i<event.roomIdArray.length; i++){
			WarpClient.getLiveRoomInfo(event.roomIdArray[i]);
		}
	};
	this.onGetOnlineUsersDone = function(event){
	};
	this.onGetLiveUserInfoDone = function(event){
	};
	this.onSetCustomUserInfoDone = function(event){
	};
}

function MyRoomRequestListener() {
	this.onSubscribeRoomDone = function(event){
	};
	this.onUnsubscribeRoomDone = function(event){
	};
	this.onJoinRoomDone = function(event){
		if(event.result == resultcode_success){
			console.log(event);
		}
		else{
			console.log('Cannot join room');
		}		
	};
	this.onLeaveRoomDone = function(event){
	};
	this.onGetLiveRoomInfoDone = function(event){
		console.log("Got room info", event);
		gotRoomInfo(event.customData);
		// var data = [];var trackid = 1354; var obj = {};
		// obj[trackid] = 1;//console.log(obj);
		// if(event.result == resultcode_success){
		// 	console.log(event);
		// 	if(!event.customData)
		// 		data = JSON.stringify(obj);
		// 	else
		// 	{
		// 		var existingData = JSON.parse(event.customData);
		// 		if(!(trackid in existingData))
		// 		{
		// 			data = existingData;
		// 			data[trackid] = 1;
		// 		}
		// 		else
		// 		{
		// 			data = existingData;
		// 			data[trackid]++;
		// 		}
		// 	}
		// addSong(event.customData);
			// console.log(data);
			// if(addSong)
			// 	addSuggestedSong();
			// else
			// 	removeSuggestedSong();
		// }		
	};
	this.onSetCustomRoomDataDone = function(event){
		console.log("Set room data", event);
		setRoomData(event);
	};
	
}

function MyUpdateRequestListener() {
	this.onSendUpdateDone = function(result){
		console.log("update sent");
	};
}

function MyNotificationListener() {
	this.onRoomCreated = function(roomdata){
		$('#chatLog').append('<p>' + 'subscribe room ' +roomdata.id + '</p>');
	};
	this.onRoomDestroyed = function(roomdata){
		$('#chatLog').append('<p>' + 'Unsubscribe room ' +roomdata.id + '</p>');
	};
	this.onUserLeftRoom = function(roomdata, user){
		if(user != local_username){
			moveRemote(0,0,"");
		}
	};
	this.onUserJoinedRoom = function(roomdata, user){
		if(current_loc_id == roomdata.id){
			// the game can start now!
			startgame(user);
		}
	};
	this.onUserLeftLobby = function(lobbydata, user){
		$('#chatLog').append('<p>' + 'user left lobby ' +user + '</p>');
	};
	this.onUserJoinedLobby = function(lobbydata, user){
		$('#chatLog').append('<p>' + 'user joined lobby' +user + '</p>');
	};
	this.onChatReceived = function(chatevent){
		$('#chatLog').append('<p>' + chatevent.sender +' says ' +chatevent.chat + '</p>');
	};
	
	this.onUpdatePeersReceived = function(updateevent){
		console.log(updateevent);
	};	
}
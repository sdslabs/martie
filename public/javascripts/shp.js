var api_key = "223cc647caa228ab2e81cc8a10680549c7344b80ab51fadf8087e3605afadcc6", 
	secret_key = "55dec85a39c2a06831b6b5002aced2c4ebc6879148511a62c0e624a61cc97c98",
	maxUsers = 100,
	username = Math.random().toString(),
	roomID = 0;


function initializeAppWarp() {
      WarpClient.initialize(api_key, secret_key);
	  WarpClient.addConnectionRequestListener(new MyConnectionRequestListener());
	  // WarpClient.addLobbyRequestListener(new MyLobbyRequestListener());
	  WarpClient.addZoneRequestListener(new MyZoneRequestListener());
	  WarpClient.addRoomRequestListener(new MyRoomRequestListener());
	  // WarpClient.addChatRequestListener(new MyChatRequestListener());
	  WarpClient.addUpdateRequestListener(new MyUpdateRequestListener());
	  WarpClient.addNotificationListener(new MyNotificationListener());
	  WarpClient.connect();
}

$(document).ready(function()
{
	initializeAppWarp();
})


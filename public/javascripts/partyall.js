var main = function()
{
    getRoom();
}

var getRoom = function()
{
    WarpClient.getAllRooms();
    this.gotRoomInfo = function(data)
    {
        // var url = window.location.href;
        // var roomname = url.substr(url.lastIndexOf("/")+1);
        // console.log(data.roomdata)
        var roomname = $('#partyurl').attr('data-party');
        if(roomname === data.roomdata.name)
        {
            roomID = data.roomdata.id;
        }
        WarpClient.joinRoom(roomID);
    }    
}


var joinedRoom = function()
{
    WarpClient.getLiveRoomInfo(roomID);
    this.gotRoomInfo = function(data)
    {
        if(data.customData)
        {
           updateData(JSON.parse(data.customData));
        }    
    }
}

var addSuggestedSong = function(trackid, title)
{
    WarpClient.getLiveRoomInfo(roomID);
    this.gotRoomInfo = function(data)
    {
        data = data.customData;
        if(data)
        {
            data = JSON.parse(data);

            if(data["suggestions"])
            {
                for(var i = 0; i < data["suggestions"].length; i++)
                {
                    if(trackid in data["suggestions"][i])
                        data["suggestions"][i][trackid]++;
                    else
                    {
                        var obj = {}; obj[trackid] = 1, obj["title"] = title;
                        data["suggestions"].push(obj);
                    }
                }
                WarpClient.setCustomRoomData(roomID, data);
            }   
            else
            {
                data["suggestions"] = [];
                var obj = {}; obj[trackid]=1, obj["title"] = title;
                data["suggestions"].push(obj);
                data = JSON.stringify(data);
                WarpClient.setCustomRoomData(roomID, data);
            }
        }
        else
        {
            data = {};
            data["suggestions"] = [];
            var obj = {}; obj[trackid]=1, obj["title"] = title;
            data["suggestions"].push(obj);
            data = JSON.stringify(data);
            WarpClient.setCustomRoomData(roomID, data);
        }

        // console.log(trackid, data);

    }
}

var updateData = function(songsList)
{
    // console.log(songsList);
    if($('#partyurl').attr('data-admin') == true)
        var admin = true;
    else
        var admin = false;
    for(var key in songsList)
    {
        $("#"+key).text("");
        for(var j = 0; j < songsList[key].length; j++)
        {
            console.log(songsList[key][j]);
            for(var attr in songsList[key][j])
            {
                if(attr != "title")
                {
                    var id = attr;
                    var votes = songsList[key][j][attr];
                }
            }
            var title = songsList[key][j]["title"];
            var img = "";
    //             console.log(attr, songsList[key][attr]);
            if(!admin)
                src = 'up.png';
            else
                src = 'plus.png';
            if(key == "suggestions")
            {
                img = '<span class="upvote"><img src="/images/'+src+'" alt></span>';
                votes = '('+votes+')';
            }
            else
                votes = "";
                $('#'+key).append('<li class="song" data-votes='+votes+'data-id="'+id+'"data-title="'+title+'">'+img+'<span class="name">'+title+votes+'</span><br></li>');

        }
    }

    setTimeout(joinedRoom, 5000);
}

var upvoteSong = function(trackid)
{
    console.log("upvoting");
    WarpClient.getLiveRoomInfo(roomID);
    this.gotRoomInfo = function(data)
    {
        data = data.customData;
        if(data)
        {
            data = JSON.parse(data);

            if(data["suggestions"])
            {
                for(var i = 0; i < data["suggestions"].length; i++)
                {
                    if(trackid in data["suggestions"][i])
                        data["suggestions"][i][trackid]++;
                }
                WarpClient.setCustomRoomData(roomID, data);
            }
        }
    }
}
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
i=0;
function onYouTubeIframeAPIReady() {
  play(0);
}

function play(i){
  var trackId = tracks[i].split("|")[0];
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: trackId,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    console.log("Play the next video");
    i=i+1;
    play(i);
  }
}
function stopVideo() {
  player.stopVideo();
}
// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '840',
        videoId: tracks[0].slice("|")[0],
        events: {
            'onStateChange': function (event) {
                switch (event.data) {
                    case -1:
                        console.log ('unstarted');
                        break;
                    case 0:
                        console.log ('ended');
                        break;
                    case 1:
                        console.log ('playing');
                        break;
                    case 2:
                        console.log ('paused');
                        break;
                    case 3:
                        console.log ('buffering');
                        break;
                    case 5:
                        console.log ('video cued');
                        break;
                }
            }
        }
    });
}

var main = function()
{
    getRoom();
}

var getRoom = function()
{
    WarpClient.getAllRooms();
    this.gotRoomInfo = function(data)
    {
        var url = window.location.href;
        var roomname = url.substr(url.lastIndexOf("/")+1);
        console.log(data.roomdata)
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
                if(trackid in data["suggestions"])
                    data["suggestions"][trackid]++;
                else
                {
                    var obj = {}; obj[trackid] = 1, obj["title"] = title;
                    data["suggestions"].push(obj);
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
    for(var key in songsList)
    {
        for(var j = 0; j < songsList[key].length; j++)
        {
            console.log(songsList[key][j]);
            for(var attr in songsList[key][j])
            {
                if(attr != "title")
                {
                    var id = attr;
                    var votes = songsList[key][j][attr];
                    break;
                }
            }
            var title = songsList[key][j]["title"];
            var img = "";
    //             console.log(attr, songsList[key][attr]);
            if($('#partyurl').attr('data-admin') == true)
                {
                    console.log(admin);
                    src = 'plus.png';
                }
            else
                src = 'up.png';
            if(key == "suggestions")
                img = '<span class="upvote"><img src="/images/'+src+'" alt></span>';
            if(!($('#'+key+' [data-id="'+id+'"]').length))
                $('#'+key).append('<li class="song" data-id="'+id+'"data-title="'+title+'">'+img+'<span class="name">'+title+'</span><br></li>');
        }
    }

    setTimeout(joinedRoom, 10000);
}


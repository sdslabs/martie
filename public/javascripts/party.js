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
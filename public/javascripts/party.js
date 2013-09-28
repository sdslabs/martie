var player;
// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
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
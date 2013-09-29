window.currentTrackId =0 ;
$(document).ready(function(){
  $.extend(soundManager.defaultOptions,{
    /** What to do when the song ends */
    onfinish:function(){
      currentTrackId=1+currentTrackId;
      window.play(currentTrackId);
    }
  });
  soundManager.setup({ url: '/swf/', flashVersion: 9 ,
onready: function(){
  window.play(0);
}}
  );
  window.play=function(i){
    var id = tracks[i].split("|")[0];
    $.getJSON("http://localhost/muzi/ajax/track/?id="+id, function(data){
      window.currentTrack = soundManager.createSound({
       // optional id, for getSoundById() look-ups etc. If omitted, an id will be generated.
       id: 'mySound'+data.id,
       url: 'http://localhost/Music/'+data.file,
       // optional sound parameters here, see Sound Properties for full list
       autoPlay: false,
      });
      window.currentTrack.play();
    });
  }

  $('#skip').click(function(){
    var current=window.currentTrack.position;
    current+=30*1000;
    window.currentTrack.setPosition(current);
  })
})
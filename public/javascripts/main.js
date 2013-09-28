$(document).ready(function()
{

  martie = {};

  martie.views = {

    renderSearchResults: function(data)
    {
      var ag = $('#artwork-grid');
      var html = '';
      for (i in data.youtube)
      {
        html += '<li class="track-div" data-id="' + data.youtube[i].id.videoId + '" data-title="' + data.youtube[i].snippet.title + '">\
          <div class="artwork"><img src="' + data.youtube[i].snippet.thumbnails.high.url + '"></div>\
          <span class="song-meta">\
            <span class="name">' + data.youtube[i].snippet.title.substring(0,20) + '</span><br>\
            <span class="artist"></span>\
          </span>\
        </li>';
      }
      for (var i=0; i<15; i++)
      {
        html += '<li class="track-div" data-id="' + data.gaana[i].track_id + '" data-title="' + data.gaana[i].track_title + '">\
          <div class="artwork"><img src="' + data.gaana[i].artwork + '"></div>\
          <span class="song-meta">\
            <span class="name">' + data.gaana[i].track_title.substring(0,20) + '</span><br>\
            <span class="artist">' + data.gaana[i].artist[0].name + '</span>\
          </span>\
        </li>';
      }
      ag.html(html);
      martie.views.applyMasonry();
    },

    applyMasonry: function(data)
    {
      $container = $('#artwork-grid');
      initialize = function() {
        $container.masonry({
          columnWidth: 150,
          itemSelector: '.track-div'
        });
        $container.animate({
          opacity: 1
        }, 200);
      };

      $container.imagesLoaded(function() {
        initialize();
      })
    }

  };

  martie.hooks = {

    renderSearchResults: function() {
      var input = $('#search-input').val();
      $('#artwork-grid').css('opacity','0');
      $.get('/search?query=' + input, function(data) {
        martie.views.renderSearchResults(data);
      })

    }

  }

  /* Attach event handlers */

  $('#search-div').submit(function(e){
    martie.hooks.renderSearchResults();
    e.preventDefault();
    return false;
  })

});
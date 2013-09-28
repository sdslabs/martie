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
        if (data.youtube[i].id.videoId !== undefined)
        {
          html += '<li class="track-div" data-id="' + data.youtube[i].id.videoId + '" data-title="' + data.youtube[i].snippet.title + '" data-artist="">\
            <div class="artwork"><img src="' + data.youtube[i].snippet.thumbnails.high.url + '"></div>\
            <span class="song-meta">\
              <span class="name">' + data.youtube[i].snippet.title.substring(0,20) + '</span><br>\
              <span class="artist"></span>\
            </span>\
          </li>';
        }
      }
      for (var i=0; i<15; i++)
      {
        html += '<li class="track-div" data-id="' + data.gaana[i].track_id + '" data-title="' + data.gaana[i].track_title + '" data-artist="' + data.gaana[i].artist[0].name + '">\
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

    addToQueue: function(el)
    {
      el.addClass('selected');
      $('#right-sidebar')
      var html = '<li class="song" data-id="' + el.data('id') + '" data-title="' + el.data('title') + '">\
        <span class="cancel"><img src="/images/cross.png" alt=""></span>\
        <span class="name">' + el.data('title') + '</span><br>\
        <span class="artist">' + el.data('artist') + '</span>\
      </li>';

      $('#queue').append(html);
    },

    removeFromQueue: function(el)
    {
      $("#queue [data-id='" + el.data('id') +"']").remove();
      $("#artwork-grid [data-id='" + el.data('id') +"']").removeClass('selected');
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

    },

    addToQueue: function(el)
    {
      partyname = $("#partyurl").data('party');
      $.ajax({
        type: 'POST',
        url: '/party/' + partyname + '/add',
        data: {
          trackId: el.data('id'),
          title: el.data('title')
        },
        success: function() {
          martie.views.addToQueue(el);
        }
      })
    },

    removeFromQueue: function(el)
    {
      martie.views.removeFromQueue(el);
      partyname = $("#partyurl").data('party');
      $.ajax({
        type: 'DELETE',
        url: '/party/' + partyname + '/' + el.data('id'),
        data: {
          title: el.data('title')
        },
        success: function() {
          martie.views.removeFromQueue(el);
        }
      })
    }

  }

  /* Attach event handlers */

  if (document.getElementById('search-div') !== null)
  {
    $('#search-div').submit(function(e){
      martie.hooks.renderSearchResults();
      e.preventDefault();
      return false;
    })
  }

  if (document.getElementById('artwork-grid') !== null)
  {
    $('#artwork-grid').on('click', '.track-div', function(){
      if ($(this).hasClass('selected'))
        martie.hooks.removeFromQueue($(this));
      else
        martie.hooks.addToQueue($(this));
    })
    $('#queue').on('click','.cancel', function(){
      martie.hooks.removeFromQueue($(this).parents('.song'));
    })
  }

});
$(document).ready(function()
{

  martie = {};

  martie.views = {

    renderSearchResults: function(data, party)
    {
      if (party != true)
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
        if (document.getElementById('loader') !== null)
          $('#loader').hide();
        martie.views.applyMasonry();
      }
      else
      {
        console.log(data);
        var html = '';
        for (var i=0; i<15; i++)
        {
          html += '<li class="song" data-id="' + data.youtube[i].id.videoId + '" data-title="' + data.youtube[i].snippet.title + '">\
              <span class="name">' + data.youtube[i].snippet.title + '</span><br>\
            </li>';
        }
        if (document.getElementById('loader') !== null)
          $('#loader').hide();
        $('#search-list').html(html);
      }
    },

    addToQueue: function(el, party)
    {
      var admin = $("#partyurl").data('admin');
      if (party == true)
      {
        var html = '<li class="song" data-id="' + el.data('id') + '" data-title="' + el.data('title') + '">';
        if (admin === true) html += '<span class="cancel"><img src="/images/cross.png" alt=""></span>';
        html += '<span class="name">' + el.data('title') + '</span><br></li>';
        $('#queue').append(html);
        el.remove();
      }
      else
      {
        el.addClass('selected');
        $('#right-sidebar')
        var html = '<li class="song" data-id="' + el.data('id') + '" data-title="' + el.data('title') + '">\
          <span class="cancel"><img src="/images/cross.png" alt=""></span>\
          <span class="name">' + el.data('title') + '</span><br>\
          <span class="artist">' + el.data('artist') + '</span>\
        </li>';

        $('#queue').append(html);
        $('#add-button').removeAttr('disabled')
      }
      addSong(el.data('id'), el.data('title'));
    },

    removeFromQueue: function(el)
    {
      $("#queue [data-id='" + el.data('id') +"']").remove();
      $("#artwork-grid [data-id='" + el.data('id') +"']").removeClass('selected');
      removeSong(el.data('id'));
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
        if (document.getElementById('loader') !== null)
          $('#loader').hide();
        initialize();
      })
    },

    upvoteTrack: function(el)
    {
      el.children('.upvote').remove();
      // var parent = $(el).parents()
      upvoteSong(el.data('id'));
    },

    addToSuggestions: function(el)
    {
      var admin = $("#partyurl").data('admin');
      console.log(admin);
      var html = '<li class="song" data-id="' + el.data('id') + '" data-title="' + el.data('title') + '">';
      if (admin == true)
        html += '<span class="plus"><img src="/images/plus.png" alt=""></span>';
      else
        html += '<span class="upvote"><img src="/images/up.png" alt=""></span>';
      html += '<span class="name">' + el.data('title') + '</span><br></li>';
      $('#suggestions').append(html);
      addSuggestedSong(el.data('id'), el.data('title'));
    }

  };

  martie.hooks = {

    renderSearchResults: function(party) {
      $('#loader').show();
      var input;
      if (party == true)
      {
        $('#search-list').html('');
        input = $('#party-search').val();
        $.get('/search?query=' + input, function(data) {
          martie.views.renderSearchResults(data, true);
        })
      }
      else
      {
        input = $('#search-input').val();
        $('#artwork-grid').css('opacity','0');
        $.get('/search?query=' + input, function(data) {
          martie.views.renderSearchResults(data);
        })
      }

    },

    addToQueue: function(el, party)
    {
      var partyname = $("#partyurl").data('party');
      $.ajax({
        type: 'POST',
        url: '/party/' + partyname + '/add',
        data: {
          trackId: el.data('id'),
          title: el.data('title')
        },
        success: function() {
          martie.views.addToQueue(el, party);
        }
      })
    },

    removeFromQueue: function(el)
    {
      // martie.views.removeFromQueue(el);
      var partyname = $("#partyurl").data('party');
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
    },

    upvoteTrack: function(el)
    {
      var partyname = $("#partyurl").data('party');
      var id = el.data('id');
      martie.views.upvoteTrack(el);
      //Make request to ShepHertz endpoint here
      // $.ajax({
      //   url: '/party/' + partyname + '/upvote/' + id,
      //   type: 'GET',
      //   data: {
      //     title: el.data('title')
      //   },
      //   success: function() {
      //   }
      // })
    },

    addToSuggestions: function(el)
    {
      var partyname = $("#partyurl").data('party');
      martie.views.addToSuggestions(el);
      //Make request to ShepHertz endpoint here
      // $.ajax({
      //   url: '/party/' + partyname + '/upvote/' + id,
      //   type: 'GET',
      //   data: {
      //     title: el.data('title')
      //   },
      //   success: function() {
      //   }
      // })
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

  if (document.getElementById('party-search') !== null)
  {
    $('#party-search').parents('form').submit(function(e){
      martie.hooks.renderSearchResults(true);
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

  if (document.getElementById('suggestions') !== null)
  {
    $('#suggestions').on('click','.upvote', function(){
      martie.hooks.upvoteTrack($(this).parents('.song'));
    })
    $('#suggestions').on('click','.plus', function(){
      console.log('plus clicked');
      martie.hooks.addToQueue($(this).parents('.song'), true);
    })
  }

  if (document.getElementById('search-list') !== null)
  {
    $('#search-list').on('click','li.song', function(){
      martie.hooks.addToSuggestions($(this));
    })
  }

});
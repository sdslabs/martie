$(document).ready(function()
{

  martie = {};

  martie.views = {

    renderSearchResults: function(data, party)
    {
      data = JSON.parse(data);
      if (party != true)
      {
        var ag = $('#artwork-grid');
        var html = '';

        for (i in data.tracks)
        {
          if (data.tracks[i].id !== undefined)
          {
            html += '<li class="track-div" data-id="' + data.tracks[i].id + '" data-title="' + data.tracks[i].title + '" data-artist="">\
              <div class="artwork"><img src="/pics/' + data.tracks[i].albumId + '.jpg"></div>\
              <span class="song-meta">\
                <span class="name">' + data.tracks[i].title.substring(0,20) + '</span><br>\
                <span class="artist"></span>\
              </span>\
            </li>';
          }
        }
        ag.html(html);
        martie.views.applyMasonry();
      }
      else
      {
        var html = '';
        for (i in data.tracks)
        {
          html += '<li class="song" data-id="' + data.tracks[i].id + '" data-title="' + data.tracks[i].title + '">\
              <span class="name">' + data.tracks[i].title + '</span><br>\
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
      addSong(el.data('id'));
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
    },

    renderQueue: function(tracks)
    {
      var html = '';
      for (i in tracks)
      {
        html += '<li class="song" data-id="' + tracks[i].split('|')[0] + '" data-title="' + tracks[i].split('|')[1] + '">\
          <span class="name">' + tracks[i].split('|')[1] + '</span><br>\
        </li>';
      }
      $('#queue').html(html);
      alert(html);
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
    },

    renderQueue: function()
    {
      var partyname = $("#partyurl").data('party');
      $.ajax({
        type: 'GET',
        url: '/party/' + partyname + '/.json',
        success: function(data) {
          martie.views.renderQueue(data);
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
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var ejs = require("ejs");
var yt=require("./youtube");
var gaana = require("./gaana");
var app = express(),
  redis = require("redis"),
    r = redis.createClient();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('This is my secret'));
app.set('view engine', 'ejs');
app.use(express.session());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Removed authentication from the app 
//Coz it required re-creating sessions
app.post('/party/:party/add', function(req, res){
  var trackId = req.body.trackId;
  var party = req.params.party;
  var title = req.body.title;
  r.rpush("tracks:"+party, trackId+"|"+title);
  res.json("Added track to main list");
});

app.del('/party/:party/:trackId',function(req, res){
  var track = req.body.track;
  var party = req.params.party;
  r.lrem("tracks:"+party, 0, track);
  res.json("Track removed");
});

/** This is the most important endpoint */
app.get('/party/:partyName.json', function(req, res){
  var partyName = req.params.partyName
  var result = r.get("party:"+partyName, function(err, response){
    //Now get the track list
    r.lrange("tracks:"+partyName, 0, -1, function(err, tracks){
      res.json({
        tracks: tracks,
        name: response
      });
    });
  });
})
app.use(express.static(path.join(__dirname,'./public')));

app.get('/party/:partyName', function(req, res){
  var isAdmin = (req.session.admin==true);
  //This is THE party page
  r.get("party:"+req.params.partyName, function(err,name){
    var urlname = req.params.partyName;
    r.lrange("tracks:"+urlname, 0, -1, function(err, tracks){
      res.render("party",{
        tracks: tracks, 
        admin: isAdmin,
        name: name, 
        urlname: req.params.partyName
      });
    });
  });
});

app.get('/', function(req, res){
  res.sendfile("./public/index.html");
});

app.post('/party/create', function(req,res){
  var partyName = req.body.partyname;
  var partyNameSanitized = partyName.replace(/\W/g,'-');
  req.session.admin=true;
  r.set("party:"+partyNameSanitized, partyName);
  res.redirect('/party/create/'+partyNameSanitized);
});

app.get("/party/create/:partyName", function(req, res){
  var partyName = req.params.partyName;
  r.get("party:"+partyName, function(err,name){
    res.render("create",{name: name, urlname: req.params.partyName});
  });
});

app.post('/youtube/length', function(req, res){
  var trackId = req.body.id;
  yt.length(trackId, function(duration){
    res.json(duration);
  });
});

app.post('/room', function(req, res){
  var roomName = req.body,name;
  var value = req.body.value;
  r.set("rooms:"+roomName, value);
  res.json("saved");
});

app.get("/room/:name", function(req, res){
  r.get("rooms:"+req.params.name, function(response){
    res.json(response);
  })
})

app.get('/search', function(req, res){
  var q = req.query.query;
  var r=require('request');
  r.get("http://localhost/muzi/ajax/search/?search="+q, function(err,response, body){
    res.send(body);
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
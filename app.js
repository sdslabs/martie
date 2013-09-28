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
})

app.post('/party/:party/suggest', function(req, res){
  var trackId = req.body.trackId;
  var partyName = req.params.party;
  var title = req.body.title;
  r.zadd("suggests:"+partyName, 1, trackId+"|"+title);
});

app.post('/party/:party/upvote', function(req, res){
  var trackId = req.body.trackId;
  var patyName = req.params.party
  r.zincrby("suggests:"+partyName, 1, trackId);
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
  //This is a party page
  //send out different things to different people
  if(req.session.admin){
    res.sendfile("./public/admin.html");
  }
  else{
    res.sendfile("./public/attendee.html");
  }
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

app.get('/search', function(req, res){
  var q = req.query.query;
  yt.search(q, function(YTresponse){
    gaana.search(q, function(Gresponse){
      res.json({
        gaana: Gresponse,
        youtube: YTresponse
      });
    });
  })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
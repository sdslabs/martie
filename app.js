/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
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
app.use(express.session());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/:party/add', function(){
  if(req.session.admin){
    
  }
  else{
    res.json("You are not admin");
  }
})

app.get('/:partyName', function(req, res){
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
  req.redirect('/'+partyNameSanitized);
})

app.use(express.static('./public'));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
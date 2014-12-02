
/**
 * Module dependencies.
 */
var DEBUG_LOG = require('./debug/logutil').DEBUG_LOG;

var express = require('express');
var routes = require('./routes');

var user = require('./routes/user');
var like = require('./routes/like');
var comment = require('./routes/comment');
var video = require('./routes/video');
var videoTag = require('./routes/videotag');
var videoCategory = require('./routes/videocategory');
var rating = require('./routes/rating');
var question = require('./routes/questionary');

var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);

var runPort = 3000;
var app = express();

// all environments
app.set('port', process.env.PORT || runPort);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.limit('200mb'));

// 参考:http://lealog.hateblo.jp/entry/2013/10/19/223202
app.configure(function() {
  app.use(express.bodyParser( { uploadDir: './public/tmp_upload' } ));
});

app.use(express.methodOverride());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// For front-end side.
// Search files according to following order.
app.use(express.static(path.join(__dirname, 'client/.tmp')));
app.use(express.static(path.join(__dirname, 'client/app')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Front-end (client side)
app.get('/', function(req, res) {
  res.sendfile('client/app/index.html');
});

// Like apis
app.get('/like/numberOfLikes/:videoid', like.numberOfLikes);
app.get('/like/like/:videoid/:userid', like.like);
app.get('/like/cancelLike/:videoid/:userid', like.cancelLike);
app.get('/like/hasLiked/:videoid/:userid', like.hasLiked);

// User apis
app.post('/user/register', user.register);
app.post('/user/unregister', user.unregister);
app.get('/user/getAllUsersInfo/', user.getAllUsersInfo);
app.get('/user/getUserInfo/:userid', user.getUserInfo);
app.get('/user/authenticate/:mail/:signinPass', user.authenticate);
app.get('/user/authenticate/:mail/:signinPass/:adminregisterkey', user.authenticate);

// Video apis
app.post('/video/upload', video.upload);
app.get('/video/getAll', video.getAll);
app.get('/video/get/:videoid', video.get);
app.get('/video/getByUserId/:userid', video.getByUserId);
app.get('/video/getByTag/:tagid', video.getByTag);
app.get('/video/getByCategory/:categoryid', video.getByCategory);
app.get('/video/delete/:videoid', video.deleteById);
app.get('/video/deleteByUserId/:userid', video.deleteByUserId);
app.get('/video/deleteByTag/:tagid', video.deleteByTag);
app.get('/video/deleteByCategory/:categoryid', video.deleteByCategory);

// Video tag apis
app.post('/videotag/add', videoTag.add);
app.get('/videotag/tag/:id', videoTag.get);
app.get('/videotag/getall', videoTag.getall);
app.get('/videotag/getpublicall', videoTag.getPublicAll);
app.get('/videotag/delete/:id', videoTag.delete);

// Video category apis
app.post('/videocategory/add', videoCategory.add);
app.get('/videocategory/get/:id', videoCategory.get);
app.get('/videocategory/getall', videoCategory.getall);
app.get('/videocategory/getpublicall', videoCategory.getPublicAll);
app.get('/videocategory/delete/:id', videoCategory.delete);

// Comment apis
app.get('/comment/find/', comment.find);
app.get('/comment/find/:videoid', comment.find);
app.post('/comment/submit', comment.submit);
app.get('/comment/delete/:commentid', comment.deleteById);
app.get('/comment/deleteByUserId/:userid', comment.deleteByUserId);

// Rating apis
app.post('/rating/add', rating.add);
app.get('/rating/delete/:ratingid', rating.delete);
app.get('/rating/find/:videoid', rating.find);

// Question apis
app.post('/question/add', question.add);
app.get('/question/getall', question.getAll);
app.get('/question/delete/:id', question.delete);
app.get('/question/updateIndex/:id/:newIndex/:currentIndex', question.updateIndex);

// For UnitTest (supertest).
module.exports = app;

http.createServer(app).listen(app.get('port'), function(){
  DEBUG_LOG('Express server listening on port ' + app.get('port'));
});


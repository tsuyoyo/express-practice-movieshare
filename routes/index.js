/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var VideoDb = require('../models/videodb.js').createClient();
var UserDb = require('../models/userdb.js').createClient();
var ObjectID = require('mongodb').ObjectID;


/**
 * Shows index view.
 *
 */
exports.index = function(req, res){
  VideoDb.findAll(function(err, videos) {
  	var user = { name : req.session.user };
  	if (videos && 0 < videos.length) {
      res.render('index', { videos : videos, user : user });
  	} else {
      res.render('index', { user : user });
  	}
  });
};

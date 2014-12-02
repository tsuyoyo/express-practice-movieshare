/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .service('Webapi', function Webapi($http, Util) {

    this.allVideos = function(callback) {
      var req = Util.makeGetRequest('/video/getAll');

      $http(req).success(function(data) {
          callback(data.videos);
        }).
        error(function(data, status) {
          console.log(status);
          callback([]);
        });
    };

    this.videoByCategory = function(categoryId, callback) {
      var req = Util.makeGetRequest('/video/getByCategory/' + categoryId);

      $http(req).success(function(data) {
        callback(data.videos);
      });
    };

    this.videoByUser = function(userId, callback) {
      var req = Util.makeGetRequest('/video/getByUserId/' + userId);

      $http(req).success(function(data) {
        callback(data.videos);
      });
    };

    this.videoByTag = function(tagId, callback) {
      var req = Util.makeGetRequest('/video/getByTag/' + tagId);

      $http(req).success(function(data) {
        callback(data.videos);
      });
    };

    this.video = function(videoId, callback) {
      var req = Util.makeGetRequest('/video/get/' + videoId);

      $http(req).success(function(data) {
        callback(data.video);
      });
    };

    this.comments = function(videoId, callback) {
      var req = Util.makeGetRequest('/comment/find/' + (videoId || ''));

      $http(req).success(function(data) {
        callback(data.comments);
      });
    };

    this.submitComment = function(videoId, userId, comment, callback) {
      var postedDateSec = (new Date()).getTime();
      var req = {
        method: 'POST',
        url: '/comment/submit',
        data: {
          videoid : videoId,
          userid  : userId,
          comment : comment,
          postedDate : postedDateSec
        }
      };
      $http(req).success(function(newComment) {
        callback(newComment);
      });
    };

    this.likesNum = function(videoId, callback) {
      var req = Util.makeGetRequest('/like/numberOfLikes/' + videoId);

      $http(req).success(function(data) {
        callback(data.likesNum);
      });
    };

    this.category = function(categoryId, callback) {
      var req = Util.makeGetRequest('/videocategory/get/' + categoryId + '/');

      $http(req).success(function(data) {
        callback(data.category);
      });
    };

    this.allCategories = function(callback) {
      var req = Util.makeGetRequest('/videocategory/getall/');

      $http(req).success(function(data) {
        callback(data.categories);
      });
    };

    this.allPublicCategories = function(callback) {
      var req = Util.makeGetRequest('/videocategory/getpublicall');

      $http(req).success(function(data) {
        callback(data.categories);
      });
    };

    this.tag = function(tagId, callback) {
      var req = Util.makeGetRequest('/videotag/tag/' + tagId);

      $http(req).success(function(data) {
        callback(data.tag);
      });
    };

    this.allTags = function(callback) {
      var req = Util.makeGetRequest('/videotag/getall/');

      $http(req).success(function(data) {
        callback(data.tags);
      });
    };

    // app.get('/like/like/:videoid/:userid', like.like);
    this.like = function(videoId, userId, callback) {
      var req = Util.makeGetRequest('/like/like/' + videoId + '/' + userId);

      $http(req).success(function(data) {
        callback(data.likesNum);
      });
    };

    this.user = function(userId, callback) {
      var req = Util.makeGetRequest('/user/getUserInfo/' + userId);

      $http(req).success(function(data) {
        callback(data);
      });
    };

    this.authenticate = function(mail, signinPass, adminKey, callback) {

      var apiUrl = '/user/authenticate/' + mail + '/' + signinPass + '/';
      if (adminKey) {
        apiUrl += adminKey + '/';
      }

      var req = Util.makeGetRequest(apiUrl);

      $http(req)
      .success(function(data) {
        callback(data.user, null);
      })
      .error(function(data) {
        callback(null, data.errMsg);
      });
    };

    this.registerUser = function(name, mail, team, type, adminRegisterKey, registerKey, callback) {

      var req = {
        method: 'POST',
        url: '/user/register',
        data: {
          name: name,
          mail: mail,
          team: team,
          type: type,
          adminregisterkey: adminRegisterKey,
          registerkey: registerKey
        }
      };
      $http(req)
      .success(function(data) {

        callback(data.user);
      })
      .error(function() {

        callback(null);
      });
    };

    this.userInfo = function(userId, callback) {
      var req = Util.makeGetRequest('/user/getUserInfo/' + userId);
      $http(req).success(function(data) {
        callback(data);
      });
    };

    this.allUsers = function(callback) {
      var req = Util.makeGetRequest('/user/getAllUsersInfo/');
      $http(req).success(function(data) {
        callback(data.users);
      });
    };

    this.rating = function(videoId, callback) {
      var req = Util.makeGetRequest('/rating/find/' + videoId);
      $http(req).success(function(rating) {
        callback(rating.rating);
      });
    };

    this.addQuestion = function(tag, type, question, options, callback) {

      var req = {
        method: 'POST',
        url: '/question/add',
        data: {
          tag: tag,
          type: type,
          question: question,
          options: options
        }
      };

      $http(req).success(function(question) {

        callback(question);

      }).error(function() {

        callback(null);
      });

    };

    this.allQuestion = function(callback) {
      var req = Util.makeGetRequest('/question/getall');
      $http(req).success(function(data) {
        callback(data.questions);
      });
    };

    this.deleteQuestion = function(id, callback) {
      var req = Util.makeGetRequest('/question/delete/' + id);
      $http(req).success(function() {
        callback();
      });
    };

    this.updateQuestionIndex = function(id, current, after, callback) {
      var req = Util.makeGetRequest('/question/updateIndex/' +
        id + '/' + after + '/'  + current);
      $http(req).success(function() {
        callback();
      });
    };

  });

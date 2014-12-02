/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .controller('PlayerCtrl', function ($scope, $http, $routeParams, $cookieStore, $location, $sce, Webapi, Constants) {

    $scope.videoId = $routeParams.videoId;

    $scope.onLike = function() {
      var user = $cookieStore.get(Constants.Cookie.USER);
      Webapi.like($scope.videoId, user._id, function(updatedNum) {
        $scope.likesNum = updatedNum;
      });
    };

    Webapi.video($scope.videoId, function(videoData) {

      // Amazon S3などへファイルを置いた場合、そのURLが安全であることを
      // 明示しておかないとcross origin policyで引っかかって再生できない
      //  SCE Strict Contextual Escaping :
      //   セキュリティ対策として、サニタイズ (textデータ上の&や<などの特殊文字を無害化する)
      //   されていないHTML要素や、信頼されていないページの要素を表示するのを防止するための機能
      //  (参考 : http://qiita.com/zoetro/items/0b01fda20f8000e485cf)
      $scope.video = $sce.trustAsResourceUrl(videoData.video);

      $scope.videoTitle = videoData.title;
      $scope.postedDate = (new Date(videoData.postedDate)).toLocaleString();

      Webapi.user(videoData.userid, function(user) {
        $scope.uploaderId = user._id;
        $scope.uploader = user.name;
      });
    });

    Webapi.likesNum($scope.videoId, function(num) {
      $scope.likesNum = num;
    });

    $scope.onUserSelected = function() {
      $location.path('/userview/' + $scope.uploaderId);
    };

  });

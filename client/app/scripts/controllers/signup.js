/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .controller('SignupCtrl', function ($scope, $cookieStore, $location, $routeParams, Webapi, Constants) {

    $scope.name = null;

    $scope.mail = null;

    $scope.team = null;

    $scope.admin = false;

    $scope.adminRegisterKey = null;

    $scope.errorMsg = null;

    $scope.registerKey = $routeParams.registerKey || null;

    $scope.postNewUser = function() {

      // userIdをCookieにしまって、Topへ戻る
      var onRegisterUser = function(user) {

        if (user) {
          $cookieStore.put(Constants.Cookie.USER, user);
          $location.path('/');
        } else {
          $scope.errorMsg = 'Failed to register account';
        }

      };

      var type = ($scope.admin) ? 'admin' : 'user';

      Webapi.registerUser($scope.name,
                          $scope.mail,
                          $scope.team,
                          type,
                          $scope.adminRegisterKey,
                          $scope.registerKey,
                          onRegisterUser);
    };

  });

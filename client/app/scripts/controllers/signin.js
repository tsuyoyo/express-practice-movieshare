/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .controller('SigninCtrl', function ($scope, $cookieStore, $location, $routeParams, Webapi, Constants) {

    $scope.mail = null;

    $scope.admin = null;

    $scope.signinPass = $routeParams.signinPass || null;

    $scope.adminRegisterKey = null;

    $scope.errMsg = null;

    $scope.$watch('selectedUser', function() {
      if ($scope.selectedUser) {
        $scope.admin = ('admin' === $scope.selectedUser.type);
      } else {
        $scope.admin = false;
      }
    });

    $scope.signin = function() {

      var onAuthenticate = function(user, errMsg) {

        if (errMsg) {
          $scope.errMsg = errMsg;
        } else {
          $cookieStore.put(Constants.Cookie.USER, user);
          $location.path('/');
        }

      };

      Webapi.authenticate($scope.selectedUser.mail,
        $scope.signinPass, $scope.adminRegisterKey, onAuthenticate);
    };

    $scope.goCreateAccount = function() {
      $location.path('signup');
    };

  });

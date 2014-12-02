/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('userinfo', function (Webapi) {
    return {
      templateUrl: 'views/directives/userinfo.html',

      restrict: 'E',

      link: function postLink(scope, element, attrs) {

        var userId = attrs.user;

        Webapi.user(userId, function(user) {
          scope.name = user.name;

          scope.mail = user.mail;

          scope.team = user.team;
        });

      }
    };
  });

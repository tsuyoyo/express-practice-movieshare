/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('userselector', function (Webapi) {
    return {

      // (ng-options 参考)
      // http://js.studio-kingdom.com/angularjs/ng_directive/select
      template:
        '<div>' +
        '  <select class="form-control" ng-model="selectedUser" ' +
        '          ng-options="user as user.name for user in users" />' +
        '</div>',

      restrict: 'E',

      link: function (scope) {

        scope.selectedUser = null;

        scope.users = null;

        var loadUsers = function() {
          Webapi.allUsers(function(users) {
            // (メモ)
            // ng-modelが見ているselectedUserに値を入れておけば、selectedに反映される
            // よって、0版要素に初期フォーカスが当たる
            if (users && 0 < users.length) {
              scope.selectedUser = users[0];
            }
            scope.users = users;
          });
        };

        loadUsers();
      }

    };
  });

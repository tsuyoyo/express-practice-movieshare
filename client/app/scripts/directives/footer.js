/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('footer', function () {
    return {

      template:
        '<div class="footer">'+
        'Copyright (c) 2014 Tsuyoyo<BR>All Rights Reserved</div>',

      restrict: 'E',

    };
  });

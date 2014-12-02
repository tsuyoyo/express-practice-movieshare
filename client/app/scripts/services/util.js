/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .service('Util', function Util() {

    this.makeGetRequest = function(url) {
      return {
        method : 'GET',
        url : url
      };
    };

  });

/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .service('Constants', function Constants() {

    /**
     * CookieStoreを利用する際の定数
     *
     */
    this.Cookie = {
      USER      : 'mcshareapp.cookie.user'
    };

  });

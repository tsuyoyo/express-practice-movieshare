'use strict';

describe('Service: Videoinfo', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate service
  var Webapi;
  beforeEach(inject(function (_Webapi_) {
    Webapi = _Webapi_;
  }));

  it('should do something', function () {
    expect(!!Webapi).toBe(true);
  });

});

'use strict';

describe('Controller: <%= classedComponentName %>Ctrl', function () {

  // load the controller's module
  beforeEach(module('<%= scriptAppName %>'));

  var <%= classedComponentName %>Ctrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    <%= classedComponentName %>Ctrl = $controller('<%= classedName %>Ctrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

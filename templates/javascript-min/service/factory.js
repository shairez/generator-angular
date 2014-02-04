'use strict';

angular.module('<%= componentModuleName %>')
  .factory('<%= classedName %>', [function() {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function() {
        return meaningOfLife;
      }
    };
  }]);

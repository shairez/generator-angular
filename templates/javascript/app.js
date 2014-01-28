'use strict';

angular.module('<%= scriptAppName %>', [<%= angularModules %>])
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: "/",
        templateUrl: 'scripts/core/main/main.tpl.html',
        controller: ''<%= scriptAppName %>'.core.main.MainCtrl'
      });
  });

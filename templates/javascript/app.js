'use strict';

angular.module('<%= scriptAppName %>', [<%= angularModules %>])
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: "/",
        templateUrl: 'scripts/main/main.tpl.html',
        controller: 'MainCtrl'
      });
  });

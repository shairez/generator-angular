'use strict';

angular.module('<%= scriptAppName %>', [<%= angularModules %>])
  .config(['$stateProvider', "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('main', {
        url: "/",
        templateUrl: 'scripts/core/main/main.tpl.html',
        controller: '<%= scriptAppName %>.core.main.MainCtrl'
      });

      $urlRouterProvider.otherwise("/");
  }]);

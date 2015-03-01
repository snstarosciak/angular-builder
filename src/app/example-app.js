angular.module('example-app', [
  'example-app.login',
  'ui.router',
  'templates-app'
])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('root', {
        url: '/',
        template: '<div>This is the application root.</div>',
        controller: 'TetCtrl'
  })

    $urlRouterProvider.otherwise('/');
})
  .controller('TestCtrl', function(debug) {
    debug('say it is so');
  });

  angular.module('example-app.login', [
    'ui-router'
  ])
    .config(function($stateProvider) {
      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'login/login.tpl.html'
        });
    });
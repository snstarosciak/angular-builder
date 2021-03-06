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
        //controller: 'TestCtrl'
  })

    $urlRouterProvider.otherwise('/');
});

  angular.module('example-app.login', [
    'ui.router'
  ])
    .config(function($stateProvider) {
      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'login/login.tpl.html'
        });
    });
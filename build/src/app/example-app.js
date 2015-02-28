angular.module('example-app', [
  'ui.router'
])
  .config(function($stateProvider) {
    $stateProvider
      .state('root', {
        url: '/',
        template: '<div>This is the application root.</div>'
	})
});

  angular.module('example-app.login', [
  ]);
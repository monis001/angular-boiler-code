//@ IMP :  https://stackoverflow.com/questions/38374145/what-is-the-calling-order-of-angularjs-functions-config-run-controller
//@ will be helpful
//@ https://docs.angularjs.org/guide/module
angular.module('myApp',[
	'ui.router',
	'myAppName.restclient',
	'myApp.api',
	'myAppName.restclient',
	'login',
	'home'
	])
	.config(function($stateProvider,$locationProvider){
		//@ app config gets setup
		//@ third party modules get's setup here 


		// $locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('');
		
	})
	.run(function($rootScope, $state){
		$rootScope.$state = $state;
	})
	.constant('HOME_DIRECTORY_URL','src/app/')

angular.module('login',[])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
   
    //@  can define all states here
        .state('login', {
            url: '/login?back_to',
           // templateUrl: "templates/security/login-tpl.html",
              template: "<h1>Hello from login</h1>",
            //controller: 'loginController',
            resolve: {
                thisIsResolveFunctions: function() {
               //@ resolve functions will run before state gets resolved
        }
            }
        })
   $urlRouterProvider.otherwise('/');
}])
// route interceptor to check user is authorized to access page
.run(function($rootScope, $state, $location, $timeout) {
   //@ this is merely used for loader on the root level
   //@ initiall is false
   //@ as the state starts it gets true -> loader shown 
   //@ error or succesful state then loader will be hide
    $rootScope.state = {
        changing: false
    };

    //@ event listener for the states
    $rootScope.$on('$stateChangeStart', function() {
        $rootScope.state.changing = true;
    })
    $rootScope.$on('$stateChangeSuccess', function() {
        $rootScope.state.changing = false;
    })
    $rootScope.$on('$stateNotFound', function() {
        $rootScope.state.changing = false;
        //$state.go('user_home.error.404');
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        $rootScope.state.changing = false;
    });
})



angular.module('home',['constants'])

.config(['$stateProvider','HOME_DIRECTORY_URL',function($stateProvider,HOME_DIRECTORY_URL){
    var homePath = HOME_DIRECTORY_URL +'home/templates/' ;
    $stateProvider
         .state('userMainHome', {
            abstract: true,
            url: '', //@ if it is parent state then we can avoid url, because parent state never runs
            //url: '',
            templateUrl: homePath+"home-tpl.html",
            //@ if controllers are very small, can provide like this inside state only
            controller: function($scope,thisIsResolveFunctions){
                console.log('Hi I am home parent')
        },
            resolve: {
                thisIsResolveFunctions: function() {
                    console.log('I will be resolve first even before parent controller');
               //@ resolve functions will run before state gets resolved
        }
            }
        })
        .state('userMainHome.dashboard',{
            url:'/dashboard',
             views: {
                    "":{
                        templateUrl:homePath +'some-tpl.html',
                        //controller: 'dashBoardController'
                    },
                    'i_am_named_view': {
                        templateUrl:homePath +'dashboard-tpl.html',
                        controller: 'dashBoardController'
                    }
                },
       })

}])
angular.module('myApp.api', [])

.factory('$myAppApi', function($myAppRestClient, API_BASE_URL, $myAppRestClientUtils) {
    return {
        //@ example
        
        // getBaseUrl: (function() {
        //     return API_BASE_URL;
        // }()),
        // projectList: (function() {
        //     return $myAppRestClient.$resource('/projects/');
        // }()),
       
    };
})

/**
 * Directive to call myAppRestClient service method directly from templates
 * Use: lazy load data using url in views (same logic of how images load in pages using src tag)
 * How to use: <any fsop-rest-client="" [fetched-varname=""]></any>
 * @author mayank
 */
.directive('myAppApi', function($myAppApi, $parse) {
    return {
        restrict: 'A',
        scope: true,
        compile: function(tElement, tAttr) {
            // NOTE: parsing done in compile phase to avoid reparsing
            var parsed = $parse(tAttr.fsopApi);
            var fetched_varname = tAttr.fetchedVarname || '$fetched'; // (optional)
            return function postLink(scope, iElement, iAttr) {
                var req = parsed(scope, $fsopApi);
                scope.$fetching = true;
                req.then(function() {
                    scope.$fetching = false;
                });
                scope[fetched_varname] = req.$object;
            };
        }
    };
})

;

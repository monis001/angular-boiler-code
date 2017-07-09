angular.module('myApp.api')
    .run(function($myAppRestClient,  $state) {

        $myAppRestClient.config.addFullRequestInterceptor(function(elem, operation, what, url, headers, params, httpConfig) {
            //@ setting up the Token Header
            // if ($userInfo.authToken.isSet()) {
            //     headers.Authorization = "Token " + $userInfo.authToken.get();
            // }
        })
        $myAppRestClient.config.setErrorInterceptor(function(response, deferred, responseHandler) {
            if (response.status === 401) {
                console.log('api-http interceptor ' + response.status);
            }
            if (response.status == 500 || response.status == 403 || response.status == 404) {
                console.log('api-http interceptor ' + response.status);
            }

            return true; // error not handled
        })
    });

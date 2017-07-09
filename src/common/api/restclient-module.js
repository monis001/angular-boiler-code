angular.module('myAppName.restclient', ['restangular'])
    .factory('API_BASE_URL', function($location) {
        return $location.protocol() + '__URL__';
    })

.factory('$myAppRestClientCacheManager', function() {
    return {
        _toCacheList: {},

        enableCaching: function(routes) {
            if (angular.isArray(routes)) { // if array
                angular.forEach(routes, function(route) {
                    this._toCacheList[route] = true;
                }, this);
            } else {
                this._toCacheList[routes] = true;
            }
        },

        isCacheEnabled: function(route) {
            return !!this._toCacheList[route];
        },

        init: function() {
            this._list = {};
        }
    };
})

.factory('$myAppRestClientUtils', function($fsopRestClient, API_BASE_URL) {
    var REGEX_ID_EXTRACT = /\d+\/$/;
    return {
        extractId: function(url) {
            if (!url) {
                return -1;
            }
            var matches = url.match(REGEX_ID_EXTRACT);
            if (matches) {
                return parseInt(matches[0].replace(/\/$/, ''));
            }
            return -1;
        },
        generateUrl: function(baseRoute, id) {
            return API_BASE_URL + baseRoute + "/" + id + "/";
        }
    };
})

.factory('$myAppRestClient', function(Restangular, $myAppRestClientCacheManager, API_BASE_URL) {
    var RestangularClient = Restangular.withConfig(function(RestangularConfigurer) {
        // API_BASE_URL
        RestangularConfigurer.setBaseUrl(API_BASE_URL);

        // append '/' to each request (Required by server Api)
        RestangularConfigurer.setRequestSuffix('/');
        RestangularConfigurer.setMethodOverriders(["put", "patch", "delete"]);
        RestangularConfigurer.addResponseInterceptor(function(data, operation) {
            var extractedData;
            // console.log(arguments);
            // .. to look for getList operations
            if (operation === "getList") {
                // .. and handle the data and meta data
                if (data.results) {
                    extractedData = data.results;

                    // if paging
                    extractedData.paging = {
                        count: data.count,
                        next: data.next,
                        prev: data.prev
                    };
                    return extractedData;
                }
            }

            return data;
        });

        RestangularConfigurer.addFullRequestInterceptor(function(elem, operation, what, url, headers, params, httpConfig) {
            if (operation == 'get' && $myAppRestClientCacheManager.isCacheEnabled(what)) { // if cache enabled for this route
                httpConfig.cache = true;
            } else {
                if (operation == 'getList' && (!params || !angular.isDefined(params.page_size))) {
                  //  params.page_size = 10;
                };
                if (operation == 'getList' && (params && angular.isDefined(params.page_size) && params.page_size == 1000)) {
                    params.page_size = 0;
                };
            }
        });

        RestangularConfigurer.setRestangularFields({
            selfLink: 'url'
        });
    });

    // will patch resource get + getList method with nested support.
    var _patchResourceWithNestedSupport = function(resource) {
        var _get = resource.get; // old get
        var _getList = resource.getList; // old getList

        RestangularClient.extendModel(resource.route, function(model) {
            model._fetchNested = function(arrayOfKeys) {
                if (!arrayOfKeys) {
                    return model;
                }

                angular.forEach(arrayOfKeys, function(key) {
                    var urls = model[key];
                    if (!urls) {
                        return;
                    }

                    if (angular.isArray(urls)) {
                        angular.forEach(urls, function(url, index) {
                            model[key][index] = model.oneUrl(key, url).get().$object;
                        })
                    } else if (angular.isString(urls)) {
                        model[key] = model.oneUrl(key, urls).get().$object;
                    }
                });

                return model;
            };

            return model;
        });

        // fetch nested
        resource.get = function() {
            var nestedParams = null;
            if (arguments.length > 1) {
                nestedParams = arguments[1].nested;
                delete arguments[1].nested;
            }

            // TODO
            var promise = _get.apply(this, arguments);
            promise.then(function(model) {
                return model._fetchNested(nestedParams);
            });
            return promise;
        };

        // fetch nested resource also
        resource.getList = function() {
            var nestedParams = null;
            if (arguments.length > 0) {
                nestedParams = arguments[0].nested;
                delete arguments[0].nested;
            }

            var promise = _getList.apply(this, arguments);
            promise.then(function(collection) {
                angular.forEach(collection, function(model) {
                    model._fetchNested(nestedParams);
                });
            });
            return promise;
        };
        return resource;
    };


    var _customHeaders = {};
    // RestangularClient.setDefaultHeaders({'Institute': "mayank"});
    var updateCustomHeaders = function() {
        console.log(_customHeaders);
        RestangularClient.setDefaultHeaders(_customHeaders);
    };

    return {
        $resource: function(route, config) {
            config = config || {};

            var resource = RestangularClient[config.single ? 'one' : 'all'](route);

            if (config.nestedPatch) { // if nestedPach enabled
                resource = _patchResourceWithNestedSupport(resource);
            }

            return resource;
        },

        $url: function(route, url) {
            return {
                getList: function() {
                    return RestangularClient.allUrl(route, url).getList.apply(undefined, arguments);
                },
                get: function() {
                    return RestangularClient.oneUrl(route, url).get.apply(undefined, arguments);
                },
                post: function() {
                    return RestangularClient.oneUrl(route, url).post.apply(undefined, arguments);
                }
            }
        },

        //@ if necessary inject upload service in this factory and uncomment and good to go
        // $upload: function(file) {
        //     var $info = {
        //         file: file,
        //         progress: 0,
        //         uploaded: false,
        //         uploading: true,
        //         error: ''
        //     };
        //     if (isFileDataUri(file))
        //     // file as data (base64 encoded string)
        //         var promise = $fsopUploadService.http({
        //         url: API_BASE_URL + 'upload_data/',
        //         method: 'POST',
        //         data: {
        //             file: file
        //         }
        //     })
        //     else {
        //         // file as normal file object
        //         var promise = $fsopUploadService.upload({
        //             url: API_BASE_URL + 'upload/',
        //             file: file, // or list of files:
        //             fileFormDataName: 'tmp_file'
        //         })
        //     }
        //     promise.progress(function(evt) {
        //         $info.progress = Math.ceil(evt.loaded / evt.total * 100);
        //     }).success(function(data) {
        //         // console.log(data);
        //         $info.url = data[0];
        //         $info.done = true;
        //         $info.uploading = false;
        //     }).error(function(data) {
        //         if (!$info._abort) { // NOTE: i'm not treating abort as error
        //             $info.error = true;
        //         }
        //         $info.done = true;
        //         $info.uploading = false;
        //     });
        //     promise.$info = $info;
        //     promise.$info.abort = function() {
        //         this._abort = true;
        //         promise.abort();
        //     };
        //     // FIXME: not a very good way to detect
        //     // but it will work for now
        //     // here i'm differentiating b/w file as object or dataUri
        //     // Note: dataUri is a normal string (base64encoded data)
        //     function isFileDataUri(file) {
        //         if (angular.isString(file)) {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     }

        //     return promise;
        // },

        $addCustomHeaders: function(headers) {
            angular.extend(_customHeaders, headers);
            updateCustomHeaders();
        },

        $removeCustomHeaders: function(headerKeys) {
            if (angular.isString(headerKeys)) { // if single entry
                delete _customHeaders[headerKeys];
            } else if (angular.isArray(headerKeys)) { // if array of keys
                angular.forEach(headerKeys, function(headerKey) {
                    delete _customHeaders[headerKey];
                });
            }
            updateCustomHeaders();
        },
        _native: RestangularClient,
        config: RestangularClient
    };
})

// // imgUploader module
// .directive('fsopUploader', function($fsopRestClient, $parse) {
//     return {
//         restrict: 'A',
//         scope: {
//             upload: '=',
//             onUploadBegin: '&',
//             onUploadError: '&',
//             onUploadProgress: '&',
//             onUploadSuccess: '&'
//         },
//         link: function(scope, element, attr) {
//             // uploading file
//             var watcher = scope.$watch('upload', function(newValue) {
//                 if (!newValue) {
//                     return;
//                 }

//                 var uploadPromise = $fsopRestClient.$upload(scope.upload);
//                 var uploadingInfo = uploadPromise.$info;
//                 // upload start
//                 scope.onUploadBegin({
//                     $uploading: uploadingInfo
//                 });

//                 // progress
//                 uploadPromise.progress(function(evt) {
//                     uploadingInfo.progress = Math.ceil(evt.loaded / evt.total * 100);
//                     scope.onUploadProgress({
//                         $progress: uploadingInfo.progress
//                     });
//                 });

//                 // success
//                 uploadPromise.success(function(data) {
//                     scope.onUploadSuccess({
//                         $url: uploadingInfo.url
//                     });
//                 });

//                 // error
//                 uploadPromise.error(function(error) {
//                     scope.onUploadError({
//                         $error: error
//                     });
//                 });

//             });
//         }
//     };
// })

/**
 * Directive to call myAppRestClient service method directly from templates
 * Use: lazy load data using url in views (same logic of how images load in pages using src tag)
 * How to use: <any fsop-rest-client="" [fetched-varname=""]></any>
 * @author mayank
 */
.directive('myAppRestClient', function($myAppRestClient, $parse) {
    return {
        restrict: 'A',
        scope: true,
        compile: function(tElement, tAttr) {
            // NOTE: parsing done in compile phase to avoid reparsing
            var parsed = $parse(tAttr.myAppRestClient);
            var fetched_varname = tAttr.fetchedVarname || '$fetched'; // (optional)
            return function postLink(scope, iElement, iAttr) {
                var req = parsed(scope, $myAppRestClient);
                scope.$fetching = true;
                req.then(function() {
                    scope.$fetching = false;
                });
                $parse(fetched_varname).assign(scope, req.$object);
            };
        }
    };
})

;

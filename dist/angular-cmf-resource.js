(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
angular.module('angular-cmf-resource')
    .factory('Resource', ['Restangular', function(Restangular) {
        var Resource = Restangular.service('phpcr_repo');
        Resource.$get = angular.noop;
        Resource.changed = false;
        Resource.pendingUuid = null;

        return Resource;
    }]);

},{}],2:[function(require,module,exports){

angular.module('angular-cmf-resource')
    .factory('ResourceService', [
        'Resource',
        'Restangular',
        '$q',
        function(Resource, Restangular, $q) {
            var ResourceService = {};
            ResourceService.ResourcesList = {};
            ResourceService.$get = angular.noop;

            var removeTrailingSlash = function(str) {
                if (str.indexOf('/') === 0) {
                    str = str.substring(1, str.length);
                }

                return str;
            };

            ResourceService.find = function(type, id) {
                var deferred = $q.defer(),
                    cleanId = removeTrailingSlash(id);

                if (_.isUndefined(cleanId)) {
                    deferred.reject(new Error('id must not be undefined.'));
                } else if (_.isUndefined(ResourceService.ResourcesList[cleanId])) {
                    Resource
                        .one(cleanId)
                        .get()
                        .then(function (resourceData) {
                            updateCachedList(resourceData);
                            deferred.resolve(ResourceService.ResourcesList[cleanId]);
                        });
                } else {
                    deferred.resolve(ResourceService.ResourcesList[cleanId]);
                }

                return deferred.promise;
            };

            ResourceService.persist = function (resource) {
                var deferred = $q.defer();

                resource.changed = true;

                // a newly created resource should be added to the local list only
                if (_.isUndefined(resource.id)) {
                    addResourceToLocalList(resource);
                } else {
                    updateCachedList(resource);
                }

                deferred.resolve(resource);

                return deferred.promise;
            };

            ResourceService.getAll = function () {
                return Resource.getList().then(function (resourceList) {
                    _.each(resourceList, function (resource) {
                        updateCachedList(resource);
                    });

                    return ResourceService.ResourcesList;
                });
            };

            function updateCachedList(resource) {
                if (_.isUndefined(ResourceService.ResourcesList[resource.id])) {
                    ResourceService.ResourcesList[resource.id] = resource;
                } else {
                    _.assign(ResourceService.ResourcesList[resource.id], resource);
                }
            }

            function addResourceToLocalList(resource) {
                resource.pendingUuid = guid();
                ResourceService.ResourcesList[resource.pendingUuid] = resource;
            }

            function guid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }

            return ResourceService;
        }]
    );

},{}],3:[function(require,module,exports){

angular.module('angular-cmf-resource.config', ['restangular'])
    .config(function(RestangularProvider) {
        RestangularProvider.setEncodeIds(false);
        RestangularProvider.setBaseUrl('api');
    });

},{}],4:[function(require,module,exports){

angular.module('angular-cmf-resource', ['angular-cmf-resource.config']);

},{}]},{},[1,2,3,4]);

angular.module('symfony-cmf-resource')
    .factory('ResourceService', [
        'Resource',
        'Restangular',
        '$q',
        function(Resource, Restangular, $q) {
            var ResourceService = {};
            ResourceService.ResoucesList = [];
            ResourceService.$get = angular.noop;

            var removeTrailingSlash = function(str) {
                if (str.indexOf('/') === 0) {
                    str = str.substring(1, str.length);
                }

                return str;
            };

            ResourceService.find = function(type, id) {
                var promise = Resource.one(removeTrailingSlash(id)).get();

                promise.then(function(resourceData) {
                    ResourceService.ResoucesList.push(resourceData);

                    return resourceData;
                });

                return promise;
            };

            return ResourceService;
        }]
    );

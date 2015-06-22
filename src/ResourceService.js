
angular.module('symfony-cmf-resource')
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

            ResourceService.getAll = function () {
                return Resource.getList().then(function (resourceList) {
                    _.each(resourceList, function (resource) {
                        updateCachedList(resource);
                    });

                    return ResourceService.ResourcesList;
                });
            };

            var updateCachedList = function (resource) {
                if (_.isUndefined(ResourceService.ResourcesList[resource.id])) {
                    ResourceService.ResourcesList[resource.id] = resource;
                } else {
                    _.assign(ResourceService.ResourcesList[resource.id], resource);
                }
            };

            return ResourceService;
        }]
    );

angular.module('DataServices')
.service('jobStatusGraphData',
         ["Rest",
             "GetBasePath",
             "ProcessErrors",
             "$rootScope",
             JobStatusGraphData]);

function JobStatusGraphData(Rest, getBasePath, processErrors, $rootScope) {

    function pluck(property, promise) {
        return promise.then(function(value) {
            return value[property];
        });
    }

    function getData(period, jobType) {
        var url = getBasePath('dashboard')+'graphs/jobs/?period='+period+'&job_type='+jobType;
        Rest.setUrl(url);
        var result = Rest.get()
        .catch(function(response) {
            var errorMessage = 'Failed to get: ' + response.url + ' GET returned: ' + response.status;

            processErrors(null,
                response.data,
                response.status,
                null, {
                    hdr: 'Error!',
                    msg: errorMessage
                });
            throw response;
        });

        return pluck('data', result);
    }

    return {
        destroyWatcher: angular.noop,
        setupWatcher: function(period, jobType) {
            this.destroyWatcher =
                $rootScope.$on('JobStatusChange', function() {
                getData(period, jobType).then(function(result) {
                    $rootScope.
                        $broadcast('DataReceived:JobStatusGraph',
                                   result);
                    return result;
                });
            });
        },
        get: function(period, jobType) {

            this.destroyWatcher();
            this.setupWatcher(period, jobType);

            return getData(period, jobType);

        }
    };
}

(function () {

    'use strict';

    angular.module("crimesApp", [])
           .value("crimesUrl", "http://data.police.uk/api/crimes-street/all-crime?lat=54.586173&lng=-5.932221&date=")
           .value("defaultDate", new Date())
           .factory("CrimesService", ["$http", "$q", "crimesUrl", CrimesService])
           .controller("CrimesController", ["CrimesService", "$q", "defaultDate", CrimesController])
           .directive("crimeLocationLink", CrimeLocationLink);


    function CrimesService($http, $q, crimesUrl) {
        return {
            fetchCrimes: function(date) {
                var deferred = $q.defer();
                $http.get(crimesUrl + date).then(function(response) {
                    deferred.resolve(response.data);
                }, function() {
                    deferred.resolve([]);
                });
                return deferred.promise;
            }
        };
    }

    function CrimesController(CrimesService, $q, defaultDate) {
        this.crimes = [];
        this.crimesService = CrimesService;
        this.$q = $q;
        this.lastSearchedDate = "";
        this.searchDate = defaultDate;
        this.isWorking = false;
    }

    CrimesController.prototype.getCrimes = function() {
        var self = this;
        var deferred = this.$q.defer();
        if (self.searchDate !== self.lastSearchedDate) {
            self.lastSearchedDate = self.searchDate;
            var searchDateString = this.searchDate.getFullYear() + "-" + (this.searchDate.getMonth() + 1);
            self.isWorking = true;
            self.crimesService.fetchCrimes(searchDateString).then(function(crimes){
                self.crimes = crimes;
                self.isWorking = false;
                deferred.resolve(self.crimes);
            });
        }
        return deferred.promise;
    };

    CrimesController.prototype.categoryOf = function(crime) {
        return crime.category;
    };

    CrimesController.prototype.outcomeOf = function(crime) {
        return (crime.outcome_status !== null) ? crime.outcome_status.category : "N/A";
    };

    function CrimeLocationLink() {
        return {
            restrict: "E",
            transclude: true,
            template: '<a ng-href="http://maps.google.co.uk?q=loc:{{lat}}+{{lng}}" target="_blank"><ng-transclude></ng-transclude></a>',
            scope: {
                lat: "=lat",
                lng: "=lng"
            }
        };
    }

}());

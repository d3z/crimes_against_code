
(function () {

    'use strict';

    angular.module("crimesApp", [])
           .service("CrimesService", ["$http", CrimesService])
           .controller("CrimesController", ["CrimesService", CrimesController])
           .directive("crimeLocationLink", CrimeLocationLink);


    function CrimesService($http) {
        this.$http = $http;
    }

    CrimesService.prototype.fetchCrimes = function(date, callback) {
        var url = "http://data.police.uk/api/crimes-street/all-crime?lat=54.586173&lng=-5.932221&date=" + date;
        this.$http.get(url)
             .success(function(data) {
                 callback(data);
             });
    };

    function CrimesController(CrimesService) {
        this.crimes = [];
        this.crimesService = CrimesService;
        this.lastSearchedDate = "";
        this.searchDate = new Date();
    }

    CrimesController.prototype.getCrimes = function() {
        var self = this;
        if (self.searchDate !== self.lastSearchedDate) {
            self.lastSearchedDate = self.searchDate;
            var searchDateString = this.searchDate.getFullYear() + "-" + this.searchDate.getMonth();
            self.crimesService.fetchCrimes(searchDateString, function(crimes){
                self.crimes = crimes;
            });
        }
    };

    CrimesController.prototype.categoryOf = function(crime) {
        return crime.category;
    }

    CrimesController.prototype.locationOf = function(crime) {
        return crime.location.street.name;
    };

    CrimesController.prototype.outcomeOf = function(crime) {
        return (crime.outcome_status !== null) ? crime.outcome_status.category : "N/A";
    };

    function CrimeLocationLink() {
        return {
            restrict: "E",
            template: '<a ng-href="http://maps.google.co.uk?q=loc:{{lat}}+{{lng}}" target="_blank">{{label}}</a>',
            scope: {
                label: "=label",
                lat: "=lat",
                lng: "=lng"
            }
        };
    }

}());

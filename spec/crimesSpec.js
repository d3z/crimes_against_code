(function () {

    'use strict';

    var crimesUrl = "http://crime-data.uk?date=";
    var searchDate = "2015-11";

    beforeEach(module("crimesApp", function($provide){
        $provide.value("crimesUrl", crimesUrl);
        $provide.value("defaultDate", new Date(searchDate));
    }));

    describe("Crimes controller", function() {

        var crimesController, $httpBackend;
        var searchUrl = crimesUrl + searchDate;

        var crimes = [
            {
                "category": "Crimes against code",
                "location": {
                    "latitude": "54.595793",
                    "longitude": "-5.930977",
                    "street": {
                        "name": "The Office"
                    }
                },
                "outcome_status": {
                    "category": "ongoing investigation",
                    "date": "2015-11"
                }
            }
        ];

        beforeEach(inject(function($controller, _$httpBackend_, CrimesService){
            $httpBackend = _$httpBackend_;
            crimesController = $controller("CrimesController", {CrimesService:CrimesService});
        }));

        it("should fetch its data from a remote service", function() {
            $httpBackend.expectGET(searchUrl).respond(function() {
                return [200, crimes];
            });
            crimesController.getCrimes();
            $httpBackend.flush();
        });

        it("should not fetch remote data when the same search is being done", function() {
            $httpBackend.expectGET(searchUrl).respond(function() {
                return [200, crimes];
            });
            crimesController.getCrimes();
            crimesController.getCrimes();
            $httpBackend.flush();
        });

        it("should use the data returned from the remote service", function() {
            $httpBackend.whenGET(searchUrl).respond(function() {
                return [200, crimes];
            });
            crimesController.getCrimes().then(function(){
                expect(crimesController.crimes).toEqual(crimes);
            });
            $httpBackend.flush();
        });

        it("should return an empty list on error", function() {
            $httpBackend.whenGET(searchUrl).respond(function() {
                return [500, "error"];
            });
            crimesController.getCrimes().then(function(){
                expect(crimesController.crimes).toEqual([]);
            });
            $httpBackend.flush();
        });

        it("should return the category of a crime", function() {
            var crime = {category: "crime"};
            expect(crimesController.categoryOf(crime)).toEqual("crime");
        });

        it("should return the outcome of a crime", function() {
            var crime = {outcome_status: {category: "outcome"}};
            expect(crimesController.outcomeOf(crime)).toEqual("outcome");
        });

        it("should return N/A for the outcome of a crime when no outcome is available", function() {
            var crime = {outcome_status: null};
            expect(crimesController.outcomeOf(crime)).toEqual("N/A");
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();
        });

    });

    describe("CrimeLocationLink directive", function() {

        var $compile;
        var $rootScope;

        beforeEach(inject(function(_$compile_, _$rootScope_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));

        it("should build an anchor tag using the provided details", function() {
            var link = $compile("<crime-location-link lat='1' lng='2'>label</crime-location-link>")($rootScope);
            $rootScope.$digest();
            expect(link.text()).toEqual("label");
            expect(link.html()).toContain('href="http://maps.google.co.uk?q=loc:1+2">');
        });

    });

}());
'use strict';

angular.module("mocks.<%= classedName %>", [])
	.factory("<%= classedName %>", ["$q", function($q){

		var mock = jasmine.createSpyObj("<%= classedName %>",
										["method"]);

		mock.$deferred = {
			method: $q.defer()
		}
		mock.method.andReturn(mock.$deferred.method.promise);

		return mock;

}])

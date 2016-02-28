angular.module('socially').directive('locationList', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/orders/location-list/location-list.html',
    controllerAs: 'locationList',
    controller: function ($scope, $reactive) {
        $reactive(this).attach($scope);

        $scope.subscribe('locations');
        $scope.subscribe('orderAbles');

        $scope.helpers({
            locations: function() {
                return Locations.find({});
            },
            orderAbles: function() {
                return OrderAbles.find({});
            }
        });

        $scope.orderAbleCount = function(locationId) {
            return OrderAbles.find({locationId: locationId}).count();
        };

        $scope.newLocation = {};
        $scope.addLocation = function() {
            $scope.newLocation.owner = Meteor.user()._id;
            $scope.newLocation.createdAt = new Date();
            Locations.insert($scope.newLocation);
            $scope.newLocation = {};
        };

        $scope.updateLocation = function(location) {
            Locations.update(location._id, {
                $set: {
                    description: location.description,
                    enabled: location.enabled
                }
            });
        }

        $scope.removeLocation = function(location) {
            Locations.remove({_id: location._id});
        };
    }
  }
});
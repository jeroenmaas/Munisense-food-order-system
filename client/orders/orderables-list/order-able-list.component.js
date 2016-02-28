angular.module('socially').directive('orderAbleList', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/orders/orderables-list/order-able-list.html',
    controllerAs: 'orderAbleList',
    controller: function ($scope, $reactive, $stateParams) {
        $reactive(this).attach($scope);

        $scope.subscribe('orderAbles');

        $scope.locationId = $stateParams.locationId;
        $scope.helpers({
            orderAbles: function() {
                return OrderAbles.find({locationId: $scope.locationId});
            }
        });

        $scope.newOrderAble = {};
        $scope.addOrderAble = function() {
            $scope.newOrderAble.owner = Meteor.user()._id;
            $scope.newOrderAble.locationId = $scope.locationId;
            $scope.newOrderAble.createdAt = new Date();
            OrderAbles.insert($scope.newOrderAble);
            $scope.newOrderAble = {};
        };

        $scope.updateOrderAble = function(orderAble) {
            OrderAbles.update(orderAble._id, {
                $set: {
                    description: orderAble.description,
                    price: orderAble.price
                }
            });
        }

        $scope.removeOrderAble = function(orderAble) {
            OrderAbles.remove({_id: orderAble._id});
        };
    }
  }
});
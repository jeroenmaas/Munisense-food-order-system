angular.module('socially').directive('orderList', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/orders/order-list/order-list.html',
        controllerAs: 'orderList',
        controller: function ($scope, $reactive) {
            $reactive(this).attach($scope);

            $scope.orderAbleItems = {};

            $scope.subscribe('orders');
            $scope.subscribe('locations');
            $scope.subscribe('orderAbles');

            $scope.helpers({
                locations: function () {
                    return Locations.find({});
                },
                orderAbles: function () {
                    return OrderAbles.find({});
                },
                myOrders: function () {
                    return Orders.find({owner: Meteor.userId()});
                },
                orders: function () {
                    return Orders.find({});
                }
            });

            $scope.getOrderAbleById = function (orderAbleId) {
                for (var i in $scope.orderAbles) {
                    if ($scope.orderAbles[i]._id == orderAbleId)
                        return $scope.orderAbles[i];
                }
                return null;
            };

            $scope.getOrderAbleItems = function (locationId) {
                if (locationId == null) {
                    var loc = Locations.find({}, {limit: 1}).fetch()[0];
                    if (!loc)
                        return [];

                    locationId = loc._id;
                }

                if (!$scope.orderAbleItems[locationId] || $scope.orderAbleItems[locationId].length == 0 || $scope.orderAbleItems[locationId].length != OrderAbles.find({locationId: locationId}).count())
                    $scope.orderAbleItems[locationId] = OrderAbles.find({locationId: locationId}).fetch();

                return $scope.orderAbleItems[locationId];
            };

            $scope.newOrderAble = {};
            $scope.newOrder = {};
            $scope.orderMenuType = 'standard';
            $scope.addOrder = function () {
                if (!Meteor.userId()) {
                    alert('Please login or create account.');
                    return;
                }

                if ($scope.orderMenuType == 'custom') {
                    $scope.orderMenuType = 'standard';
                    $scope.newOrderAble.owner = Meteor.user()._id;
                    $scope.newOrderAble.locationId = $scope.currentLocationId;
                    $scope.newOrderAble.createdAt = new Date();
                    Meteor.call('addOrderAble', $scope.newOrderAble, function (error, result) {
                        $scope.placeOrder(result);
                        $scope.currentOrderAbleId = result;
                    });
                } else {
                    $scope.placeOrder($scope.currentOrderAbleId);
                }
            };

            $scope.placeOrder = function (orderAbleId) {
                $scope.newOrder.owner = Meteor.userId();
                $scope.newOrder.username = Meteor.user().username;
                $scope.newOrder.orderAbleId = orderAbleId;
                Orders.insert($scope.newOrder);
                $scope.newOrder = {};
                $scope.currentLocationId = {};
                $scope.currentOrderAbleId = null;
            };

            $scope.removeOrder = function(order) {
                Orders.remove({_id: order._id});
            };

            $scope.cachedIndex = [];
            $scope.prepareToFilter = function (orders) {
                $scope.cachedIndex = [];
                return orders;
            };

            $scope.groupOrders = function (order) {
                var isNew = $scope.cachedIndex.indexOf(order.orderAbleId) == -1;
                if (isNew) {
                    $scope.cachedIndex.push(order.orderAbleId);
                }
                return isNew;
            };

            $scope.getOrderWithOrderAbleId = function (orders, orderAbleId) {
                var ordersToReturn = [];
                for (var i in orders) {
                    if (orders[i].orderAbleId == orderAbleId)
                        ordersToReturn.push(orders[i]);
                }
                return ordersToReturn;
            };

            $('select').change(function () {
                if ($(this).children('option:first-child').is(':selected')) {
                    $(this).addClass('placeholder');
                } else {
                    $(this).removeClass('placeholder');
                }
            });
        }
    }
});

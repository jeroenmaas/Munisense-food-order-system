Orders = new Mongo.Collection("orders");

Orders.allow({
  insert: function (userId, order) {
    return userId && order.owner === userId;
  },
  update: function (userId, order, fields, modifier) {
    return userId && order.owner === userId;
  },
  remove: function (userId, order) {
    return true;
  }
});

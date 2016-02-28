OrderAbles = new Mongo.Collection("orderAbles");

OrderAbles.allow({
  insert: function (userId, order) {
    return userId && order.owner === userId;
  },
  update: function (userId, order, fields, modifier) {
    return userId != null;
  },
  remove: function (userId, order) {
    return userId != null;
  }
});
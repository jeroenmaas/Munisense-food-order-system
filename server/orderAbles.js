Meteor.publish("orderAbles", function () {
    return OrderAbles.find({});
});

Meteor.methods({
    addOrderAble : function(orderAble) {
        return OrderAbles.insert(orderAble);
    }
});
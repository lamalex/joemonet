Meteor.publish('expenses', function() {
  return Expenses.find({'userId': this.userId});
});

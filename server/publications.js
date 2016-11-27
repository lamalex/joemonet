Meteor.publish('expenses', () => {
  return Expenses.find({});
});

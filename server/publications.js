Meteor.publish('cashflow', function() {
  return CashFlow.find({'userId': this.userId});
});

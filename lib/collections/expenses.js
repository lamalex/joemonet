CashFlow = new Mongo.Collection('cashflow');

var CashFlowSchema = new SimpleSchema({
  'title': {
    type: String,
    label: "Display name of financial event"
  },
  'amount' : {
    type: Number,
    decimal: true
  },
  'start' : {
    type: Number,
    label: 'Date/time of event in MS since epoch'
  },
  'paid' : {
    type: Boolean,
    label: 'Whether or not paid'
  },
  'userId': {
    type: String,
    label: 'ID of owning user'
  },
  'occurance': {
    type: String,
    label: 'Denotes occurance interval'
  },
  'origin': {
    type: String,
    label: 'ObjectID of the user created event. Self if not a generated event'
  }
});
CashFlow.attachSchema(CashFlowSchema);

CashFlow.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

CashFlow.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Meteor.methods({
  addFlow: function(flow) {
    check(this.userId, String);
    check(flow, {
      title: String,
      amount: Number,
      start: Number,
      paid: Boolean,
      occurance: String,
      origin: String
    });

    flow.userId = this.userId;
    flow.start = moment(flow.start).utc().startOf('day').valueOf();

    // Ensure we're getting a negative number for our expense amount
    if (expense.type === 'flow' && flow.amount > 0) {
      flow.amount = flow.amount * -1.00;
    } else {
      //just make sure we're entering a float and not an int
      flow.amount = flow.amount * 1.00;
    }

    CashFlow.insert(flow, function(error, id) {
      if (error) {
        return error;
      }
      return id;
    });
  },
  editFlow: function(flow) {
    check(this.userId, String);
    check(flow.id, String);
    check(flow.title, String);
    check(flow.amount, Number);
    check(flow.start, Number);

    CashFlow.update({'_id': flow.id}, { $set:
      {
        title: flow.title,
        amount: flow.amount * 1.00,
        start: flow.start
      }
    });
  },
  removeFlow: function(flowId) {
    check(flowId, String);
    CashFlow.remove({'_id': flowId});
  },
  markPaid: function(flowId, date) {
    check(this.userId, String);
    check(flowId, String);
    check(date, Number);

    CashFlow.update({'_id': flowId}, {paid: true});
  },
  aggregate: function(filter, group) {
    if (Meteor.isServer) {
      return CashFlow.aggregate(
        filter,
        group
      );
    }
  },
  cleanGenerated: function() {
    var remove = CashFlow.remove({generated: true});
    return remove.writeConcernError;
  }
});

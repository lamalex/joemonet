CashFlow = new Mongo.Collection('cashflow');

var CashFlowSchema = new SimpleSchema({
  'title': {
    type: String,
    label: "Display name of financial event"
  },
  'type': {
    type: String,
    label: "Cash flow in (income), or cashflow out (expense)"
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
    optional: true,
    label: 'Denotes occurance interval'
  },
  'origin': {
    type: String,
    optional: true,
    label: 'ObjectID of the user created event. Undefined if not a generated event'
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

CashFlow.after.find(function (userId, selector, options, cursor) {
  console.log(JSON.stringify(selector));
  if (!selector) {
    return;
  }

  if ('start' in selector) {
    var endOfView = selector.start['$lte'];
    if (!endOfView) {
      return;
    }

    var results = cursor.fetch()
    results = _.reject(results, (flow) => {
      return flow.occurance == undefined || flow.occurance.toLowerCase() === 'never';
    });

    results = _.groupBy(results, (flow) => {
      if ('origin' in flow) {
        return flow.origin;
      } else {
        return flow._id;
      }
    });

    var newFlows = [];
    _.each(_.keys(results), (group) => {
      var latest = _.max(results[group], (flow) => {
        return flow.start;
      });

      if (latest.start < endOfView) {
        var nextOccurance = moment(latest.start)
        nextOccurance.add(1, latest.occurance);
        var nextFlow = _.clone(latest);
        delete nextFlow._id;
        delete nextFlow.userId;

        while (nextOccurance.valueOf() <= endOfView) {
          nextFlow.start = nextOccurance.valueOf();
          nextFlow.origin = group;
          newFlows.push(_.clone(nextFlow));
          nextOccurance.add(1, latest.occurance);
        }
      }
    });

    _.each(newFlows, (flow) => {
      Meteor.call('addFlow', flow);
    });
  }
});

Meteor.methods({
  addFlow: function addFlow(flow) {
    check(this.userId, String);
    check(flow, {
      title: String,
      type: Match.OneOf('income', 'expense'),
      amount: Number,
      start: Number,
      paid: Boolean,
      occurance: Match.OneOf('Yearly', 'y', 'Monthly', 'M', 'Weekly', 'w', 'Daily', 'd', 'Never', undefined),
      origin: Match.Maybe(String)
    });

    if (!flow.origin) {
      flow.origin = undefined;
    }

    flow.userId = this.userId;
    flow.start = moment(flow.start).utc().startOf('day').valueOf();

    // Ensure we're getting a negative number for our expense amount
    if (flow.type === 'expense') {
      if (flow.amount > 0) {
        flow.amount = flow.amount * -1.00;
      } else {
        //just make sure we're entering a float and not an int
        flow.amount = flow.amount * 1.00;
      }
    } else if (flow.type === 'income') {
      if (flow.amount < 0) {
        flow.amount = flow.amount * -1.00;
      } else {
        flow.amount = flow.amount * 1.00;
      }
    }

    switch (flow.occurance) {
      case 'Yearly':
        flow.occurance = 'y';
        break;
      case 'Monthly':
        flow.occurance = 'M';
        break;
      case 'Weekly':
        flow.occurance = 'w';
        break;
      case 'Daily':
        flow.occurance = 'd';
        break;
      case 'Never':
        flow.occurance = undefined;
        break;
    }

    CashFlow.direct.insert(flow, function(error, id) {
      if (error) {
        throw error;
      }
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

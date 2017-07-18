function isPast(date) {
  if (!(date instanceof moment)) {
    date = moment(date);
  }

  var today = moment().utc().subtract(1, 'day').endOf('day');
  return date.utc().isBefore(today);
}

CashFlow = new Mongo.Collection('cashflow');
AccountBalance = new Mongo.Collection(null);

var CashFlowSchema = new SimpleSchema({
  'title': {
    type: String,
    label: 'Title: Display name of cash flow'
  },
  'type': {
    type: String,
    label: 'Type: cash flow in (income), or cash flow out (expense)'
  },
  'amount' : {
    type: Number,
    decimal: true,
    label: 'Amount: value of cash flow. +(income), -(expense)'
  },
  'start' : {
    type: Number,
    label: 'Start: Date/time of event in MS since epoch'
  },
  'paid' : {
    type: Boolean,
    label: 'Paid: Whether or not paid'
  },
  'userId': {
    type: String,
    label: 'UserId: ID of owning user'
  },
  'occurance': {
    type: String,
    optional: true,
    label: 'Occurance: Denotes occurance interval'
  },
  'origin': {
    type: String,
    label: 'Origin: ObjectID of the user created event. _id if not a generated event'
  },
  'deleted': {
    type: Boolean,
    label: 'Deleted: Cash flow has been deleted and will no longer be shown'
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
  if (!selector) {
    return;
  }

  var results = cursor.fetch();

  // Generate future
  if ('start' in selector) {
    var endOfView = selector.start['$lte'];
    if (!endOfView) {
      return;
    } else {
      generateUntil(endOfView, results);
    }
  }

  // Insert bank balances.
  var user = Meteor.users.findOne(userId);
  if (!user){
    return;
  }

  var accountbalance = user.profile.balance;
  if (!accountbalance) {
    return
  }

  results = _.groupBy(_.reject(results, (result) => {
    return isPast(result.start) || result.deleted
  }), 'start');
  _.map(results, (result, start) => {
    var totalFlowForDay = _.reduce(result, (sum, flow) => {
      return sum + flow.amount;
    }, 0);

    accountbalance = accountbalance + totalFlowForDay;
    var bal = {
      _id: String(start),
      title: 'Balance',
      amount: accountbalance,
      start: Number(start)
    }

    AccountBalance.insert(bal, (err, res) => {
      //console.log('failed to insert balance: ' + JSON.stringify(bal) + ': ' + err);
    });
  });
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
      origin: Match.Maybe(String),
      deleted: Match.Maybe(Boolean)
    });

    if (!flow.origin) {
      flow.origin = 'TEMP';
    }

    flow.userId = this.userId;
    flow.start = moment(flow.start).utc().startOf('day').valueOf();
    flow.deleted = false;

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

      if (flow.origin === 'TEMP') {
        CashFlow.direct.update({'_id': id}, {$set: {'origin': id}});
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
    check(this.userId, String);
    check(flowId, String);
    CashFlow.update({'_id': flowId}, {$set: {deleted: true}});
  },
  removeFlows: function(flowIds) {
    check(this.userId, String);
    check(flowIds, [String]);
    CashFlow.update({'_id': {$in: flowIds}}, {$set: {deleted: true}}, {multi: true});
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

function generateUntil(lteDate, results) {
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

    if (latest.start < lteDate && !latest.deleted) {
      var nextOccurance = moment(latest.start)
      nextOccurance.add(1, latest.occurance);
      var nextFlow = _.clone(latest);
      delete nextFlow._id;
      delete nextFlow.userId;

      while (nextOccurance.valueOf() <= lteDate) {
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

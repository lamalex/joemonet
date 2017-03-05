Expenses = new Mongo.Collection('expenses');
var ExpensesSchema = new SimpleSchema({
  'title': {
    type: String,
    label: "Display name of financial event"
  },
  'type': {
    type: String,
    label: "Type of event (income or expense)"
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
    type: [Number],
    label: 'Whether or not expense was paid'
  },
  'userId': {
    type: String,
    label: 'ID of user that expenses belong to'
  },
  'occurance': {
    type: String,
    label: 'Denotes interval expense repeats'
  }
});
Expenses.attachSchema(ExpensesSchema);

Expenses.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Expenses.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Meteor.methods({
  addExpense: function(expense) {
    check(this.userId, String);
    check(expense, {
      title: String,
      type: String,
      amount: Number,
      start: Number,
      paid: [Number],
      occurance: String
    });

    expense.userId = this.userId;
    expense.start = moment(expense.start).utc().startOf('day').valueOf();

    Expenses.insert(expense, function(error, id) {
      return error;
    });
  },
  editExpense: function(expense) {
    check(this.userId, String);
    check(expense.id, String);
    check(expense.title, String);
    check(expense.amount, Number);
    check(expense.start, Number);

    Expenses.update({'_id': expense.id}, { $set:
      {
        title: expense.title,
        amount: expense.amount,
        start: expense.start
      }
    });
  },
  removeExpense: function(expenseId) {
    check(expenseId, String);
    Expenses.remove({'_id': expenseId});
  },
  markPaid: function(expenseId, date) {
    check(this.userId, String);
    check(expenseId, String);
    check(date, Number);

    Expenses.update({'_id': expenseId}, {$push: {paid: date}});
  }
});

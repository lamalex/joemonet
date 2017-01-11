Expenses = new Mongo.Collection('expenses');
/*
Expenses.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Expenses.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});
*/
let ExpensesSchema = new SimpleSchema({
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
    type: Boolean,
    label: 'Whether or not expense was paid'
  },
  'userId': {
    type: String,
    label: 'ID of user that expenses belong to'
  }
});

Expenses.attachSchema(ExpensesSchema);

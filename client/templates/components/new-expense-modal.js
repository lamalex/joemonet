Template.newExpenseModal.events({
  'submit form': function(e) {
    e.preventDefault();

    var date = Session.get('activeDate');

    var expense = {
      title: $(e.target).find('#expenseName').val(),
      type: "expense",
      amount: $(e.target).find('#expenseAmount').val(),
      start: date,
      reoccurance: {
        'freq': $(e.target).find('.tab-content .active')[0].id,
        'first': date
      }
    }

    Expenses.insert(expense);
    $('#new-expense-modal').modal('hide');
  }
})

Template.newExpenseModal.helpers({
  'reoccursYearDate': function() {
    return "TEMPORARILY DISABLED";
  },
  'reoccursMonthDate': function() {
    return "TEMPORARILY DISABLED";
  },
  'reoccursWeekDate': function() {
    return "TEMPORARILY DISABLED";
  }
});

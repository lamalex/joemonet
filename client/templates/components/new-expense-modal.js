Template.newExpenseModal.events({
  'submit form': function(e) {
    e.preventDefault();

    var date = JSON.parse(Session.get('activeMoment'));
    date = moment(date).startOf('day').valueOf();

    var expense = {
      title: $(e.target).find('#expenseName').val(),
      type: Session.get('monettype'),
      amount: Number($(e.target).find('#expenseAmount').val()),
      start: date,
      paid: false
      /*reoccurance: {
        'freq': $(e.target).find('.tab-content .active')[0].id,
        'first': date
      }*/
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

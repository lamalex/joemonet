Template.newExpenseModal.events({
  'submit form': function(e) {
    e.preventDefault();
    var expense = {
      title: $(e.target).find('#expenseName').val(),
      amount: $(e.target).find('#expenseAmount').val(),
      start: Session.get('activeDate')
    }

    Expenses.insert(expense);
    $('#new-expense-modal').modal('hide');
  }
})

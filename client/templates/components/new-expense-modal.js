Template.newExpenseModal.onRendered(() => {
  $('#new-expense-modal').on('hide.bs.modal', (e) => {
    $('#expenseName').val("");
    $('#expenseAmount').val("");
    Session.set('expenseModalData', undefined);
    //$('#reoccuranceTabs a[href=#monthly]').tab('show');
  }).on('show.bs.modal', (e) => {
    var modal = $(e.target);
    var link = $(e.relatedTarget);
    var modalData = Session.get('expenseModalData');

    var expenseType = link.data('monettype');
    if (expenseType === undefined && modalData !== undefined) {
      var expense = Expenses.findOne({'_id': modalData.expense});
      expenseType = expense.type;
    }

    Session.set('monettype', expenseType);

    var addLabel = modal.find('#add-expense-label');
    addLabel.text('Add an ' + expenseType);
    var nameInput = modal.find('#expenseName');
    nameInput.attr('placeholder', 'Your ' + expenseType + '\'s name.');
    var amountInput = modal.find('#expenseAmount');
    amountInput.attr('placeholder', 'Your ' + expenseType + '\'s amount.');
    var submitButton = modal.find('#expenseSubmit');
    submitButton.val("Add " + expenseType);

    if (modalData && modalData.type === 'edit') {
      submitButton.val("Update " + expenseType);
      nameInput.val(expense.title);
      amountInput.val(expense.amount);
    }
  });
});

Template.newExpenseModal.events({
  'submit form': function(e) {
    e.preventDefault();
    var modalData = Session.get('expenseModalData');
    var date = Session.get('activeMoment');
    date = moment(date).utc().startOf('day').valueOf();

    var expense = {
      title: $(e.target).find('#expenseName').val(),
      type: Session.get('monettype'),
      amount: Number($(e.target).find('#expenseAmount').val()),
      start: date,
      paid: []
      /*reoccurance: {
        'freq': $(e.target).find('.tab-content .active')[0].id,
        'first': date
      }*/
    }

    if (modalData && modalData.type === "edit") {
      expense.id = modalData.expense;
      Meteor.call('editExpense', expense, function(error) {
        if (error)
          console.log('editExpense error: ' + error);
      });
    } else {
      Meteor.call('addExpense', expense, function(error) {
        if (error)
          console.log('addExpense error: ' + error);
      });
    }
    $('#new-expense-modal').modal('hide');
  }
})

Template.newExpenseModal.helpers({
  'reoccursYearDate': function() {
    return moment(Session.get('activeMoment')).utc().date();
  },
  'reoccursMonthDate': function() {
    return moment(Session.get('activeMoment')).date();
  },
  'reoccursWeekDate': function() {
    return "TEMPORARILY DISABLED";
  }
});

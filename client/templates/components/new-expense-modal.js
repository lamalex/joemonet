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
    var date = JSON.parse(Session.get('activeMoment'));
    date = moment(date).startOf('day').valueOf();

    var expense = {
      title: $(e.target).find('#expenseName').val(),
      type: Session.get('monettype'),
      amount: Number($(e.target).find('#expenseAmount').val()),
      // FIXME -- this jacks up on edit. we dont want to change the date!
      start: date,
      paid: false
      /*reoccurance: {
        'freq': $(e.target).find('.tab-content .active')[0].id,
        'first': date
      }*/
    }


    if (modalData && modalData.type === "edit") {
      Expenses.update({'_id': modalData.expense}, {$set: expense});
    } else {
      Expenses.insert(expense);
    }
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

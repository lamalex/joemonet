Template.newCashFlowModal.onRendered(() => {
  $('#new-cashflow-modal').on('hide.bs.modal', (e) => {
    // Reset fields
    $('#cashFlowName').val("");
    $('#cashFlowAmount').val("");
    Session.set('cashFlowModalData', undefined);
    $('#reoccuranceTabs a[href=#monthly]').tab('show');
  }).on('show.bs.modal', function(e) {
    $('.popover').popover('destroy');
    var modal = $(this);
    var link = $(e.relatedTarget);
    var modalData = Session.get('cashFlowModalData');

    var flowType = link.data('monettype');
    if (flowType === undefined && modalData !== undefined) {
      var flow = CashFlow.findOne({'_id': modalData.flow});
      flowType = (flow.amount < 0) ? "expense" : "income"
    }

    Session.set('cashFlowType', flowType);

    var addLabel = modal.find('#add-cashflow-label');
    addLabel.text('Add an ' + flowType);
    var nameInput = modal.find('#cashFlowName');
    nameInput.attr('placeholder', 'Your ' + flowType + '\'s name.');
    var amountInput = modal.find('#cashFlowAmount');
    amountInput.attr('placeholder', 'Your ' + flowType + '\'s amount.');
    var submitButton = modal.find('#cashFlowSubmit');
    submitButton.val("Add " + flowType);

    if (modalData && modalData.type === 'edit') {
      submitButton.val("Update " + flowType);
      nameInput.val(flow.title);
      amountInput.val(flow.amount);
    }
  });
});

/*
Template.newCashFlowModal.events({
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
      paid: [],
      occurance: $(e.target).find('.tab-content .active')[0].id,
      generated: false
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
*/

Template.newCashFlowModal.helpers({
  'cashFlowType': () => {
    return Session.get('cashFlowType');
  },
  'cashFlowModalAction': () => {
    var modalData = Session.get('cashFlowModalData');
    if (modalData) {
      return modalData.type;
    }
    return "Add";
  },
  'reoccursYearDate': function() {
    return moment(Session.get('activeMoment')).utc().date();
  },
  'reoccursMonthDate': function() {
    return moment(Session.get('activeMoment')).utc().date();
  },
  'reoccursWeekDate': function() {
    return moment(Session.get('activeMoment')).utc().format('dddd');
  }
});

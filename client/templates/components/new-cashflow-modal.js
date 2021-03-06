Template.newCashFlowModal.onRendered(() => {
  $('#new-cashflow-modal').on('show.bs.modal', function(e) {
    $('.popover').popover('destroy');

    var modal = $(this);
    var link = $(e.relatedTarget);
    var flowType = link.data('cashflowtype');
    //var modalData = Session.get('cashFlowModalData');

    /*if (flowType === undefined && modalData !== undefined) {
      var flow = CashFlow.findOne({'_id': modalData.flow});
      flowType = (flow.amount < 0) ? "expense" : "income"
    }*/

    Session.set('cashFlowType', flowType);

  /*
    if (modalData && modalData.type === 'edit') {
      submitButton.val("Update " + flowType);
      nameInput.val(flow.title);
      amountInput.val(flow.amount);
    }
    */
  }).on('hide.bs.modal', (e) => {
    // Reset fields
    $('#cashFlowName').val("");
    $('#cashFlowAmount').val("");
    Session.set('cashFlowModalData', undefined);
    $('#reoccuranceTabs > div > ul > li.active > a').tab('show');

  });
});

Template.newCashFlowModal.events({
  'submit form': function(e) {
    e.preventDefault();
    //var modalData = Session.get('expenseModalData');
    var date = Session.get('activeMoment');
    date = moment(date).utc().startOf('day').valueOf();

    var flow = {
      title: $(e.target).find('#cashFlowName').val(),
      type: Session.get('cashFlowType'),
      amount: Number($(e.target).find('#cashFlowAmount').val()),
      start: date,
      paid: false,
      occurance: $('#reoccuranceTabs').find('li.active').text()
    }

    Meteor.call('addFlow', flow, function(error, response) {
      if (error) {
        Bert.alert({
          type: 'danger',
          message: error.message,
          style: 'growl-top-right'
        });
      }
      $('#new-cashflow-modal').modal('hide');
    });

    /*
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
    */

  }
})

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

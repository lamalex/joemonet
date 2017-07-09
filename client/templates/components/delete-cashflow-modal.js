var showError = (error) => {
  if (error) {
    Bert.alert({
      type: 'danger',
      message: error,
      style: 'growl-top-right'
    });
  }
}

Template.deleteCashFlowModal.onRendered(() => {
  $('#delete-cashflow-modal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var flow = {};
    flow.id = button.data('flow-id');
    flow.title = button.data('flow-title');
    flow.occurance = button.data('flow-occurance');
    flow.origin = button.data('flow-origin');

    Session.set('deleteFlowData', {
      'id': flow.id,
      'title': flow.title,
      'origin': flow.origin,
      'occurance': flow.occurance
    });
  });
});

Template.deleteCashFlowModal.helpers({
  'cashFlowTitle': () => {
    return Session.get('deleteFlowData').title;
  },
  'cashFlowReoccurs': () => {
    var occurance = Session.get('deleteFlowData').occurance;
    return occurance !== 'undefined' && occurance !== 'Never';
  }
});

Template.deleteCashFlowModal.events({
  'click .flow-delete-one': () => {
    var flowId = Session.get('deleteFlowData').id;
    Meteor.call('removeFlow', flowId, showError);
  },
  'click .flow-delete-future': () => {

  },
  'click .flow-delete-all': () => {
    var origin = Session.get('deleteFlowData').origin;
    var allFlows = [];
    var matches = CashFlow.direct.find({'origin': origin}).fetch();

    allFlows.push(origin);
    allFlows = allFlows.concat(_.pluck(matches, '_id'));
    _.each(allFlows, (flow) => {
      Meteor.call('removeFlow', flow, showError);
    });
  }
})

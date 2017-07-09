var showError = (error) => {
  if (error) {
    Bert.alert({
      type: 'danger',
      message: error,
      style: 'growl-top-right'
    });
  }
}

function safeSessionGet(sesvar, field) {
  var sesvar = Session.get(sesvar);
  if (sesvar) {
    return sesvar[field];
  } else {
    return undefined;
  }
}

Template.deleteCashFlowModal.onRendered(() => {
  $('#delete-cashflow-modal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var flow = {};
    flow.id = button.data('flow-id');
    flow.title = button.data('flow-title');
    flow.start = button.data('flow-start');
    flow.occurance = button.data('flow-occurance');
    flow.origin = button.data('flow-origin');

    Session.set('deleteFlowData', {
      'id': flow.id,
      'title': flow.title,
      'start': flow.start,
      'origin': flow.origin,
      'occurance': flow.occurance
    });
  });
});

Template.deleteCashFlowModal.helpers({
  'cashFlowTitle': () => {
    return safeSessionGet('deleteFlowData', 'title');
    return Session.get('deleteFlowData').title;
  },
  'cashFlowReoccurs': () => {
    var occurance = safeSessionGet('deleteFlowData', 'title');//Session.get('deleteFlowData').occurance;
    return occurance !== 'undefined' && occurance !== 'Never';
  }
});

Template.deleteCashFlowModal.events({
  'click .flow-delete-one': () => {
    var flowId = Session.get('deleteFlowData').id;
    Meteor.call('removeFlow', flowId, showError);
  },
  'click .flow-delete-future': () => {
    var start = Session.get('deleteFlowData').start;
    var origin = Session.get('deleteFlowData').origin;

    var matches = _.pluck(CashFlow.direct.find({$and:
      [
        {'start': {$gte: start}},
        {'origin': origin}
      ]
    }).fetch(), '_id');
    Meteor.call('removeFlows', matches, showError);
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

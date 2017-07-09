Template.deleteCashFlowModal.onRendered(() => {
  $('#delete-cashflow-modal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var flow = {};
    flow.id = button.data('flow-id');
    flow.title = button.data('flow-title');
    flow.occurance = button.data('flow-occurance');
    Session.set('deleteFlowId', flow.id);
    Session.set('deleteFlowTitle', flow.title);
    Session.set('deleteFlowOccurance', flow.occurance);
  });
});

Template.deleteCashFlowModal.helpers({
  'cashFlowTitle': () => {
    return Session.get('deleteFlowTitle');
  },
  'cashFlowReoccurs': () => {
    var occurance = Session.get('deleteFlowOccurance');
    return occurance !== 'undefined' && occurance !== 'Never';
  }
});

Template.deleteCashFlowModal.events({
  'click .flow-delete-one': () => {
    var flowId = Session.get('deleteFlowId');
    Meteor.call('removeFlow', flowId, function(error, res) {
      if (error) {
        Bert.alert({
          type: 'danger',
          message: error,
          style: 'growl-top-right'
        });
      }
    });
  },
  'click .flow-delete-future': () => {

  },
  'click .flow-delete-all': () => {

  }
})

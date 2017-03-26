Template.layout.events({
  'click .resend-verify-link'(e, template) {
    Meteor.call('sendVerificationLink', (err, response) => {
      // alert!
    });
  }
});

Template.layout.onRendered(function() {
  this.find('#main')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  }
});

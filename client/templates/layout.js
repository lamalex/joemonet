Template.layout.events({
  'click .resend-verify-link'(e, template) {
    Meteor.call('sendVerificationLink', (err, response) => {
      // alert!
    });
  }
});

Template.landing.onRendered(function() {
  this.find('#wrapper')._uihooks = {
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

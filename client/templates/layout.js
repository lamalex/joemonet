Template.layout.events({
  'click .resend-verify-link'(e, template) {
    Meteor.call('sendVerificationLink', (err, response) => {
      // alert!
    });
  }
})

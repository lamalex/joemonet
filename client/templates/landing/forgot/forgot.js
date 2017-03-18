var doneCallback;
Accounts.onResetPasswordLink((token, done) => {
  Session.set('resetPasswordToken', token);
  doneCallback = done;
});

Template.forgot.onRendered(() => {
  $('#forgot').validate({
    rules: {
      forgotemail: {
        required: true
      }
    }
  })
});

Template.forgot.events({
  'submit form': function(e, template) {
    e.preventDefault();

    var email = $('#forgotEmail').val();
    var options = {};
    options.email = email;
    Accounts.forgotPassword(options, (err) => {
      if (err) {
        var validator = $('#forgot').validate();
        validator.showErrors({
          'forgotemail': 'Email not found. Would you like to <a href="/register">register?</a>'
        });
      } else {
        Bert.alert({
          message: 'A password reset email has been sent to ' + email,
          type: 'info',
          icon: 'fa-envelope-o'
        });
        Meteor.setTimeout(() => {
          Router.go('/login');
        }, Bert.defaults.hideDelay);
      }
    });
  }
});

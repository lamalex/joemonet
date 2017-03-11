var doneCallback;
Accounts.onResetPasswordLink((token, done) => {
  Session.set('resetPasswordToken', token);
  doneCallback = done;
});

Template.forgot.events({
  'submit form': function(e, template) {
    var email = $('#forgotEmail').val();
    return Accounts.forgotPassword({
      'email': email
    });
  }
});

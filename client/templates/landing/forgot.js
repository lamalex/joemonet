var doneCallback;
Accounts.onResetPasswordLink((token, done) => {
  Session.set('resetPasswordToken', token);
  doneCallback = done;
});

Template.forgot.events({
  'submit form': function(e, template) {
    e.preventDefault();

    var email = $('#forgotEmail').val();
    Accounts.forgotPassword(email, (err) => {
      $('#forgotPassword').hide();
      $('#login').show();
    });
  }
});

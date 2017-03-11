Template.reset.events({
  'submit form': function(e, template) {
    e.preventDefault();
    var newPassword = $('#resetPassword').val();
    Accounts.resetPassword(Session.get('resetPasswordToken'), newPassword, (err) => {
      if (err) {
        console.log(err);
        return;
      }

      Session.set('resetPasswordToken', undefined);
      if (doneCallback) {
        doneCallback();
      }
    });
  }
});

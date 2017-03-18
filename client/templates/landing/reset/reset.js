Template.reset.onRendered(() => {
  $('#reset').validate({
    rules: {
      resetpassword_confirm: {
        equalTo: '#resetPassword'
      }
    },
    messages: {
      resetpassword_confirm: {
        equalTo: 'Passwords do not match'
      }
    }
  });
})

Template.reset.events({
  'submit form': function(e, template) {
    e.preventDefault();
    var newPassword = $('#resetPassword').val();
    Accounts.resetPassword(Session.get('resetPasswordToken'), newPassword, (err) => {
      if (err) {
        var validator = $('#reset').validate();
        validator.showErrors({'resetpassword_confirm': err.reason});
        return;
      }

      Session.set('resetPasswordToken', undefined);
      Bert.alert({
        message: 'Your password was reset!',
        type: 'success',
        icon: 'fa-thumbs-o-up'
      })
      if (doneCallback) {
        doneCallback();
      }
    });
  }
});

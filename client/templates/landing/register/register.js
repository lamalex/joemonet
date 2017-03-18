Template.register.onRendered(() => {
  $('#register').validate({
    rules: {
      registeremail: {
        required: true
      },
      registerpassword: {
        required: true
      },
      registerpassword_confirm: {
        equalTo: '#registerPassword'
      }
    },
    messages: {
      registerpassword_confirm: {
        equalTo: 'Passwords do not match'
      }
    }
  })
});

Template.register.events({
  'submit form': function(e, template) {
    e.preventDefault();

    var user = {
      email: $('#registerEmail').val(),
      password: $('#registerPassword').val(),
      profile: {
        'balance': 0.00
      }
    }

    Accounts.createUser(user, (err) => {
      if (err) {
        var validator = $('#register').validate();
        if (err.error === 403) {
          validator.showErrors({
            'registeremail': 'That email is already registered. Did you <a href="/forgot">forget your password?</a>'
          });
        } else {
          validator.showErrors({'registeremail': err.reason});
        }
      } else {
        Meteor.call('sendVerificationLink', (err, response) => {
          Bert.alert({
            message: 'An account verification email has been sent to ' + user.email,
            type: 'success',
            icon: 'fa-envelope-o'
          });
          Meteor.setTimeout(() => {
            Router.go('/login')
          }, Bert.defaults.hideDelay);
        });
      }
    });
  }
});

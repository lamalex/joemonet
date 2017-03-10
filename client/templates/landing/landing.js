Template.login.events({
  'submit form': function(e, template) {
    e.preventDefault();

    Meteor.loginWithPassword($('#loginEmail').val(), $('#loginPassword').val(), function(err) {
      console.log(err);
    });
  }
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
    console.log(user);

    if (user.password !== $('#registerPasswordConfirm').val()) {
        console.log('Passwords do not match')
        return;
    }

    Accounts.createUser(user, (err) => {
      if (err) {
        console.log(err)
      } else {
        Meteor.call('sendVerificationLink', (err, response) => {
          //
        });
      }
    });
  },
  'click .change_link': function(e, template) {
    $('#register').toggle();
  }
});

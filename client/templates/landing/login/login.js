
Template.login.onRendered(() => {
  $('#login').validate({
    rules: {
      loginemail: {
        required: true
      },
      loginpassword: {
        required: true
      }
    },
    messages: {
      loginemail: {
        required: 'Email address cannot be blank'
      },
      loginpassword: {
        required: 'Password cannot be blank'
      }
    }
  });
});

Template.login.events({
  'submit form': function(e, template) {
    e.preventDefault();

    Meteor.loginWithPassword($('#loginEmail').val(), $('#loginPassword').val(), function(err) {
      if (err) {
        var validator = $('#login').validate();
        var error = err.reason.toLowerCase().split(' ').join('-');

        if (error === "user-not-found") {
          validator.showErrors({'loginemail': 'User does not exist'});
        } else if (error === "incorrect-password") {
          validator.showErrors({'loginpassword': 'Password was incorrect'});
        } else {
          validator.showErrors({
            'loginemail': 'Uh-oh! Something unexpected happened <i class="fa fa-ambulance"></i>'
          })
        }
      } else {
        Router.go('/');
      }
    });
  }
});

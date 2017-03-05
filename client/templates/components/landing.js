Template.landing.onRendered(() => {
    $('.change_link').on('click', function(e) {
        $('#register').toggle();
    });

    $('.login').on('click', function(e) {
      e.preventDefault();
      console.log('clicked login');
      Meteor.loginWithPassword($('#loginEmail').val(), $('#loginPassword').val(), function(err) {
        console.log(err);
      });
    });
});
/*Template.register.events({
  'submit form': function(e) {
    e.preventDefault();
    var email = e.target.registerEmail.value;
    var passwd = e.target.registerPassword.value;
    Accounts.createUser({
      email: email,
      password: passwd
    });
  }
});

Template.login.events({
  'submit form': function(e) {
    e.preventDefault();
    var email = e.target.loginEmail.value;
    var passwd = e.target.loginPassword.value;
    Meteor.loginWithPassword(email, passwd, function(err) {
      // handle login error!;
    });
  }
});
*/

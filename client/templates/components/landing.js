Template.landing.onRendered(() => {
    $('.change_link').on('click', function(e) {
        $('#register').toggle();
    });

    $('.login').on('click', function(e) {
      e.preventDefault();
      Meteor.loginWithPassword($('#loginEmail').val(), $('#loginPassword').val(), function(err) {

      });
    });

    $('.register').on('click', function(e) {
      e.preventDefault();
      var email = $('#registerEmail').val();
      var passwd = $('#registerPassword').val();
      var passwdConfirm = $('#registerPasswordConfirm').val();
      if (passwd === passwdConfirm) {
        Accounts.createUser({
          email: email,
          password: passwd
        }, function (err) {

        });
      }
      else {
      }
    });
});

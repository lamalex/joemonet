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

    $('.register').on('click', function(e) {
      e.preventDefault();
      var email = $('#registerEmail');
      var passwd = $('#registerPassword');
      Accounts.createUser({
        email: email,
        password: passwd
      });
    });
});

Template.landing.helpers({
  'hasToken': function() {
    return Session.get('resetPasswordToken');
  }
});

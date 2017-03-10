Meteor.methods({
  sendVerificationLink() {
    var userId = Meteor.userId();
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
  }
});

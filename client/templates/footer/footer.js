Template.footer.onRendered(() => {
  $('.logout').on('click', () => {
    Meteor.logout();
  });
})

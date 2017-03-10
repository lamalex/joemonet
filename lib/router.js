Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('expenses'); }
});

Router.route('/', {name: 'calendar'});
Router.onBeforeAction(function() {
  if (!Meteor.user()) {
    this.render('landing');
  } else {
    this.next();
  }
}, {only: 'calendar'});

Router.route('/#/verify-email/:token', (params) => {
  Accounts.verify(params.token, (err) => {
    if (err) {
      // ALERT THE USER!
      console.log(err);
    } else {
      this.redirect('/');
    }
  });
});

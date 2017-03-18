Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('expenses'); }
});

Router.route('/', {name: 'calendar'});
Router.onBeforeAction(function() {
  if (!Meteor.user()) {
    this.redirect('/login');
  } else {
    this.next();
  }
}, {only: 'calendar'});

Router.route('/login', function() {
  this.render('landing');
  this.render('login', {to: 'LandingContent'});
});

Router.route('/register', function() {
  this.render('landing');
  this.render('register', {to: 'LandingContent'});
});

Router.route('/forgot', function() {
  this.render('landing');
  this.render('forgot', {to: 'LandingContent'});
});

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

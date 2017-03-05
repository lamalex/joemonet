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

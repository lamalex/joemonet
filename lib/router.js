Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('expenses'); }
});

Router.route('/', {name: 'calendar'});

Template.landing.helpers({
  'hasToken': function() {
    return Session.get('resetPasswordToken');
  }
});

Template.landing.onRendered(function() {
  this.find('#wrapper')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  }
});

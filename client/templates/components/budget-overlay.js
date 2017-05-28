function setAvailableFunds() {
  var af = Session.get('accountbalance') + Session.get('monthIncome') + Session.get('monthExpenses');
  Session.set('availableFunds', af);
  Session.set('budgetedFunds', 0);
}

Template.budgetOverlay.events({
  'click .closebtn': () => {
    $('#budget-sidebar').css('width', '0');
  }
});

Template.budgetOverlay.onRendered(() => {
  setAvailableFunds();

  $("#slider1").slider();
  $("#slider1").on("slide", function(slideEvt) {
    $("#slider1SliderVal").text(slideEvt.value);
    Session.set('budgetedFunds', slideEvt.value);
  });

  $("#slider2").slider();
  $("#slider2").on("slide", function(slideEvt) {
    $("#slider2SliderVal").text(slideEvt.value);
  });

  $("#slider3").slider();
  $("#slider3").on("slide", function(slideEvt) {
    $("#slider3SliderVal").text(slideEvt.value);
  });

  $('.slider').css('width', '90%');
  $('.slider').css('height', '45px');
});

Template.budgetOverlay.helpers({
  'bankBalance': () => {
    return accounting.formatMoney(Session.get('accountbalance'));
  },
  'monthIncome': () => {
    return accounting.formatMoney(Session.get('monthIncome'));
  },
  'monthExpenses': () => {
    return accounting.formatMoney(Session.get('monthExpenses'));
  },
  'flexNumber': () => {
    return accounting.formatMoney(Session.get('monthIncome') + Session.get('monthExpenses'));
  },
  'availableFunds': () => {
    return accounting.formatMoney(Session.get('availableFunds') - Session.get('budgetedFunds'));
  },
  'availableFundsAsNumber': () => {
    return Session.get('availableFunds');
  }
});

Template.budgetOverlay.events({
  'click .closebtn': () => {
    $('#budget-sidebar').css('width', '0');
  }
});

Template.budgetOverlay.onRendered(() => {
  $("#slider1").slider();
  $("#slider1").on("slide", function(slideEvt) {
    $("#slider1SliderVal").text(slideEvt.value);
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
})

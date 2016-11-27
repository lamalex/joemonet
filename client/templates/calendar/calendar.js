import { Template } from 'meteor/templating';

import './calendar.html';

var lastPopoverTd = null

Template.calendar.onRendered(() => {
  $('#calendar').fullCalendar({
    header: {
      right: 'today basicWeek,month prev,next'
    },
    events: function(start, end, timezone, callback) {
      let data = Expenses.find().fetch().map((expense) => {
        return expense;
      });

      callback(data);
    },
    dayClick: function(date, jsEvent, view) {
      if (lastPopoverTd)
        lastPopoverTd.popover('destroy');

      lastPopoverTd = $(this);
      $(this).popover({
        container: 'body',
        html: true,
        content: '<a href="#" data-toggle="modal" data-target="#new-expense-modal">Add an expense</a> | <a href="#">Add income</a>',
        placement: 'top',
      });
    }/*,
    eventMouseover: function(event, jsEvent, view) {
      $(this).popover({
        container: 'body',
        html: true,
        title: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>',
        content: 'PAY THIS BILL',
        placement: 'bottom',
      });
    }*/
  });
  
  Tracker.autorun( () => {
    Expenses.find().fetch();
    $('#calendar').fullCalendar('refetchEvents');
  });
});

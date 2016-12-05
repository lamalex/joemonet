import { Template } from 'meteor/templating';

import './calendar.html';

var index = 0;
var popovers = new Array(2);

//doing !1 gives false and !0 gives true; convert false->0 and true->1
function boolToIndex(bool) {
  return Number(bool);
}

//duplicated code broken out into a function
function destroyPopover(i) {
  popovers[i].popover('destroy');
  popovers[i] = null;
  $(window).unbind();
}

Template.calendar.onRendered(() => {
  $('#new-expense-modal').on('show.bs.modal', function(event) {
    Session.set('activeDate', $(event.relatedTarget).data('date'))
  });

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
    // WORKAROUND: when we switch views destroy all popovers, otherwise they linger
    viewDestroy: function() {
      if (popovers[old] != null) {
        destroyPopover(old);
      }

      if (popovers[index] != null) {
        destroyPopover(index);
      }
    },
    dayClick: function(date, jsEvent, view) {
      // we want to shift from 0 -> 1 and 1 -> 0 each time so we can destroy the old popover
      old = index;
      index = boolToIndex(!index);
      // FIXME need moment.js docs to get this right.
      strDate = date._d.getFullYear() + '-' + (date._d.getMonth() + 1) + '-0' + (date._d.getDate() + 1);
      // If i could get this to work with the popover defined in the DOM I would. Any tips?
      popovers[index] = $(this).popover({
        container: 'body',
        html: true,
        content: '<a href="#" data-toggle="modal" data-target="#new-expense-modal" data-date="'+strDate+'">Add an expense</a> | <a href="#">Add income</a>',
        placement: 'top',
        trigger: 'click'

      }).on('shown.bs.popover', () => {
        /* This is a massive and stupid work around, but basically after each click
         * we evaluate if we have a popover showing and destroy it.
         * [old] != null will work if we're clicking in calendar, and the else
         * takes care of clicks otherwise in the body of the page with the notable
         * exception of the view buttons, which jack it all up probably due to DOM
         * rendering, so we have actually catch the viewDestroy event and destroy the
         * popovers there. so far this works, although it's hacky.
         */
        $(window).click((e) => {
          if (popovers[old] != null) {
            destroyPopover(old);
          } else {
            destroyPopover(index);
          }
        });
      });
    }
  });

  Tracker.autorun( () => {
    // When new expenses get added to the DB make sure we refresh the calendar
    Expenses.find().fetch();
    $('#calendar').fullCalendar('refetchEvents');
  });
});

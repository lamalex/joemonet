var old = 0;
var index = 0;
var popovers = new Array(2);

//doing !1 gives false and !0 gives true; convert false->0 and true->1
function boolToIndex(bool) {
  return Number(bool);
}

function isPast(date) {
  var today = moment().format();
  return moment(today).isAfter(date);
}

//duplicated code broken out into a function
function destroyPopover(i) {
  if (popovers[i] !== null) {
    popovers[i].popover('destroy');
    popovers[i] = null;
    $(window).unbind();
  }
}

Template.calendar.onRendered(() => {
  $('#new-expense-modal')
  .on('hide.bs.modal', function(e) {
    $('#expenseName').val("");
    $('#expenseAmount').val("");
    $('#reoccuranceTabs a[href=#monthly]').tab('show');
  })
  .on('show.bs.modal', function(e) {
    var link = $(e.relatedTarget);``
    var type = link.data('monettype');
    var modal = $(this);

    modal.find('#add-expense-label').text('Add an ' + type);
    modal.find('#expenseName').attr('placeholder', 'Your ' + type + '\'s name.');
    modal.find('#expenseAmount').attr('placeholder', 'Your ' + type + '\'s amount.');
    modal.find('#expenseSubmit').val("Add " + type);
    Session.set('monettype', type);
  });

  $('#calendar').fullCalendar({
    header: {
      right: 'today basicWeek,month prev,next'
    },
    events: function(start, end, timezone, callback) {
      bankaccount = 7817.60;
      let data = Expenses.find({
        $or: [
          { $and: [
            { start: { $gte: moment().startOf('day').valueOf() }},
            { paid: false }
          ]},
          { paid: false }
        ]
      }, {sort: {'start': 1} }).fetch().map((expense) => {

        if (expense.type === 'expense') {
          bankaccount = bankaccount - expense.amount;
        } else if (expense.type === 'income') {
          // for some reason casting is necessary here? i have no idea why
          bankaccount = bankaccount + expense.amount;
        }

        return [
          {
            'id': expense._id,
            'start': expense.start,
            'title': expense.title,
            'amount': expense.amount,
            'type': expense.type,
            'textColor': (expense.type === 'expense') ? '#B90000' : '#5CB85C',
            'editable': !isPast(expense.start)
          },
          {
            'id': expense.start,
            'start': expense.start,
            'title': 'Balance',
            'amount': bankaccount,
            'type': 'balance',
            'textColor': '#BDBDBD'
          }
        ]
      });

      // Fixes the double balance bug by walking the list of bills/balances
      // backwards and saying "have i already seen this balance event?"
      // if I have, throw it away. By going backwards we should always have
      // the most subtracted or most added balance for a given duplicate.
      // ... I think. It's working so far.
      data = _.reduceRight(data, function(a, b) {
        if (_.findWhere(a, {type: 'balance', id: b[1].id})) {
          return a.concat(b[0]);
        }
        return a.concat(b);
      }, []);
      callback(data);
    },
    eventOrder: "type",
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

      // append the day (ie. sun, mon in the form of 0, 1, etc) to the array.
      Session.set('activeMoment', JSON.stringify(date));

      // If i could get this to work with the popover defined in the DOM I would. Any tips?
      popovers[index] = $(this).popover({
        container: 'body',
        html: true,
        content: `
          <a href="#" data-toggle="modal" data-target="#new-expense-modal" data-monettype="expense">Add an expense</a> |
          <a href="#" data-toggle="modal" data-target="#new-expense-modal" data-monettype="income">Add income</a>
        `,
        placement: 'top',
        trigger: 'click'

      }).on('shown.bs.popover', function(event) {
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
    },
    eventColor: "transparent",
    eventRender: function(expense, element, view) {
      amount = element.find('.fc-time');
      amount.text(accounting.formatMoney(expense.amount));

      wrapper = $('<span class="jm-edit-wrapper"></span>');
      markPaid = $('<span class="glyphicon glyphicon-send" aria-hidden="true"></span>')
      markPaid.click(function() {
        Expenses.update({'_id': expense.id}, {$set: {paid: true}});
      });

      edit = $('<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');
      edit.click(function() {
        Session.set('expenseModalData', {type: 'edit', expense: expense.id});
        $('#new-expense-modal').modal('show');
      });

      trash = $('<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>');
      trash.click(function() {
        Expenses.remove({'_id': expense.id});
      })

      markPaid.appendTo(wrapper);
      if (!isPast(expense.start))
        edit.appendTo(wrapper);
      trash.appendTo(wrapper);
      wrapper.appendTo(amount).hide()
    },
    eventClick: function(expense, jsevent, view) {
      if (expense.type === "balance") {
        return;
      }

      // slide edit/delete buttons into view
      $(jsevent.currentTarget).find('.jm-edit-wrapper').toggle('fast');
    }
  });

  Tracker.autorun( () => {
    // When new expenses get added to the DB make sure we refresh the calendar
    $('#calendar').fullCalendar('refetchEvents');
  });
});

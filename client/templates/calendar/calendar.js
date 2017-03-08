var old = 0;
var index = 0;
var popovers = new Array(2);

//doing !1 gives false and !0 gives true; convert false->0 and true->1
function boolToIndex(bool) {
  return Number(bool);
}

function isPast(date) {
  var today = moment().utc().startOf('day').valueOf();
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
  $('#calendar').fullCalendar({
    header: {
      right: 'today basicWeek,month prev,next'
    },
    viewRender: function(view, element) {
      var fcCenter = element.parents().find('.fc-center');
      if (fcCenter.children().length == 0) {
        var accountInput = $('<input id="bank-balance-input"></div>');
        accountInput.val(Meteor.user().profile.balance);
        accountInput.addClass('form-control');
        accountInput.attr('type', 'number');
        accountInput.keyup(function() {
          accountUpdated = true;
          Session.set('accountbalance', $(this).val());
        });

        accountInput.popover({
          'content': 'Today\'s bank balance',
          'placement': 'right',
          'trigger': 'focus',
          'delay': 175
        });

        fcCenter.append(accountInput);
      }
    },
    events: function(start, end, timezone, callback) {
      var bankaccount = Session.get('accountbalance') === undefined
        ? Meteor.user().profile.balance
        : Session.get('accountbalance');
      bankaccount = Number(bankaccount);

      let data = Expenses.find({
        /*$and: [
            { start: { $gte: moment(start).utc().startOf('day').valueOf() }},
            { start: { $lte: moment(end).utc().valueOf() }}
          ]*/
      }, {sort: {'start': 1} }).fetch().map((expense) => {
        return {
            'id': expense._id,
            'start': expense.start,
            'title': expense.title,
            'amount': expense.amount,
            'type': expense.type,
            'textColor': (expense.type === 'expense') ? '#B90000' : '#5CB85C',
            'editable': true,
            'paid': expense.paid,
            'occurance': expense.occurance
          };
      });

      // Generate future occurances of events.
      future = [];
      _.map(_.filter(data, (e) => { return e.occurance !== 'never' && e.occurance !== undefined; }), (expense) => {
        var nextOccurance;
        var nextStart = moment(expense.start).utc().add(1, expense.occurance).valueOf();
        while (nextStart <= end) {
          nextOccurance = _.clone(expense);
          nextOccurance.start = nextStart;
          future.push(_.clone(nextOccurance));
          nextStart = moment(nextOccurance.start).utc().add(1, nextOccurance.occurance).valueOf();
        }
      });
      data = data.concat(future);

      // FIX ME !! dont erase paid bills, just make them inactive and dont sum them when determining
      //  bank balances.
      // throw out any member of data whose 'start' is also a member of it's paid array
      data = _.reject(data, (e) => {
        return _.contains(e.paid, e.start);
      });

      // Calculate daily balance for each set of expenses/income
      _.map(_.uniq(_.pluck(data, 'start')), (s) => {
        if (!moment(s).utc().isBefore(moment().utc().startOf('day'))) {
          var sum = _.reduce(_.where(data, {'start': s}), (sum, nexp) => {
            if (nexp.type === 'expense') {
              return sum - nexp.amount;
            } else if (nexp.type === 'income') {
              return sum + nexp.amount;
            } else {
              return sum;
            }
          }, 0);

          bankaccount = bankaccount + sum;

          data.push({
            'title': 'Balance',
            'start': s,
            'amount': bankaccount,
            'editable': false,
            'textColor': '#BDBDBD',
            'type': 'balance'
          });
        }
      });

      callback(data);
    },
    eventOrder: [function(a,b) {
      if (a.type === "balance") {
        return -1
      } else if (b.type === "balance") {
        return 1
      }
      else return a.type - b.type;
    }, "-amount"],
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
      Session.set('activeMoment', date.utc().valueOf());

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
        var startPaid = expense.start.utc().startOf('day').valueOf();
        Meteor.call('markPaid', expense.id, startPaid, function(error, res) {
          if (error) {
            console.log('MARK PAID ERROR: ' + error);
          }
        });
      });

      edit = $('<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');
      edit.click(function() {
        Session.set('activeMoment', expense.start.utc().valueOf());
        Session.set('expenseModalData', {type: 'edit', expense: expense.id});
        $('#new-expense-modal').modal('show');
      });

      trash = $('<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>');
      trash.click(function() {
        Meteor.call('removeExpense', expense.id, function(error, res) {
          if (error) {
            console.log('REMOVE ERROR: ' + error);
          }
        });
      })

      markPaid.appendTo(wrapper);
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
    },
    eventDrop: function(expense, delta, revertFunc) {
      if (isPast(expense.start)) {
        revertFunc();
        return;
      }
      clone = {
        'id': expense.id,
        'start': expense.start.utc().startOf('day').valueOf(),
        'title': expense.title,
        'amount': expense.amount
      };
      //expense.start = moment(expense.start).startOf('day').valueOf();
      Meteor.call('editExpense', clone, function(error) {
        if (error) {
          console.log('editExpense error: ' + error);
        }
      });
    }
  });

  Tracker.autorun( () => {
    // When new expenses get added to the DB make sure we refresh the calendar
    var calendar = $('#calendar');
    var view = calendar.fullCalendar('getView');
    Expenses.find({$and: [
      {'start': {$gte: view.start.valueOf()}},
      {'start': {$lte: view.end.valueOf()}}
    ]}).fetch();
    Session.get('accountbalance');
    calendar.fullCalendar('refetchEvents');
  });

  // prevent these from showing while we're waiting for calendar load. it's ugly.
  $('.footer-links').show();
});

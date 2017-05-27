var old = 0;
var index = 0;
var popovers = new Array(2);

//doing !1 gives false and !0 gives true; convert false->0 and true->1
function boolToIndex(bool) {
  return Number(bool);
}

function isPast(date) {
  if (!(date instanceof moment)) {
    date = moment(date);
  }

  var today = moment().utc().subtract(1, 'day').endOf('day');
  return date.utc().isBefore(today);
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
    customButtons: {
        budget: {
            text: 'budget',
            icon: 'fa-money',
            click: () => {
              $('#budget-sidebar').css('width', '40%');
            }
        }
    },
    header: {
      right: 'today basicWeek,month prev,next budget'
    },
    viewRender: function(view, element) {
      // clean out old generated expenses
      $('.fc-icon-fa-money').append('<i class="fa fa-money"></i>');
      
      Meteor.call('cleanGenerated', (error, result) => {
        if (error) {
          console.log(error);
        }

        // Generate future expenses
        let data = Expenses.find({
          start: { $lte: view.end.endOf('day').valueOf() }
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
              'occurance': expense.occurance,
              'generated': expense.generated
            };
        });

        // Generate future occurances of events.
        _.map(_.filter(data, (e) => { return e.occurance !== 'never' && e.occurance !== undefined; }), (expense) => {
          var nextOccurance;
          var nextStart = moment(expense.start).utc().add(1, expense.occurance).valueOf();
          while (nextStart <= view.end) {
            nextOccurance = _.clone(expense);
            nextOccurance.start = nextStart;
            nextOccurance.generated = true;
            nextOccurance = _.pick(nextOccurance,
              'title',
              'type',
              'amount',
              'start',
              'paid',
              'occurance',
              'generated'
            );

            Meteor.call('addExpense', nextOccurance, function(error, id) {
              if (error) {
                console.log(error);
              }
            });
            nextStart = moment(nextOccurance.start).utc().add(1, nextOccurance.occurance).valueOf();
          }
        });
      });

      var fcCenter = element.parents().find('.fc-center');
      if (fcCenter.children().length == 0) {
        var accountInput = $('<input id="bank-balance-input"></div>');
        accountInput.val(Meteor.user().profile.balance);
        accountInput.addClass('form-control');
        accountInput.attr('type', 'number');
        accountInput.keyup(function() {
          Session.set('accountbalance', $(this).val());
          Meteor.users.update(Meteor.userId(), {$set: {"profile.balance": $(this).val()}});
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

      // What I really want is FullExpenses.find()-- but how do i know how far out to
      // project? I need it to be a live expansion of results.
      // I would be ok with this code living in the client except I want to use aggregation!
      // what happens if I meteor.call with an entire collection?
      let data = Expenses.find({
        start: { $lte: end.endOf('day').valueOf() }
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

      /*
      var firstOfMonth;
      var endOfMonth;

      if (start.date() === 1) {
        firstOfMonth = start.valueOf();
      } else {
        firstOfMonth = start.add(1, 'month').startOf('month').valueOf();
      }

      if (end.date() > 28) {
        endOfMonth = end.valueOf();
      } else {
        endOfMonth = end.subtract(1, 'month').endOf('month').valueOf();
      }

      Meteor.call('aggregate',
        {
          $match: {
              $and: [
                { start: { $gte: firstOfMonth }},
                { start: { $lte: endOfMonth }}
              ]
          }
        },
        {
          $group: {
            _id: '$type', amount: {$sum: '$amount'}
          }
        },
        (error, result) => {
          if (error) {
            console.log(error);
          }

          console.log(result);
        }
      );
      */
      Meteor.call('aggregate',
        {
          $match: {
            start: { $lte: end.endOf('day').valueOf() }
          }
        },
        {
          $group: {
            _id: '$start', amount: {$sum: '$amount'}
          }
        },
        (error, result) => {
          if (error) {
            Bert.alert("SOMESING WONG IN BALANCE aggregate");
            return;
          }
          _.map(_.sortBy(result, '_id'), (sum) => {
            if (!isPast(sum._id)) {
              //console.log(sum._id + ': ' +  bankaccount + ' - ' + sum.amount);
              bankaccount = bankaccount + sum.amount;
              $('#calendar').fullCalendar('removeEvents', sum._id);
              data.push({
                'id': sum._id,
                'title': 'Balance',
                'start': sum._id,
                'amount': bankaccount,
                'editable': false,
                'textColor': '#BDBDBD',
                'type': 'balance'
              });
            }
          });
          callback(data)
        }
      );
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
      let clone = {
        'id': expense.id,
        'start': expense.start.utc().startOf('day').valueOf(),
        'title': expense.title,
        'amount': expense.amount
      };

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

    if (view.start && view.end) {
      Expenses.find({$and: [
        {'start': {$gte: view.start.valueOf()}},
        {'start': {$lte: view.end.valueOf()}}
      ]}).fetch();
    } else {
      Expenses.find();
    }

    Session.get('accountbalance');
    calendar.fullCalendar('refetchEvents');
  });

  // prevent these from showing while we're waiting for calendar load. it's ugly.
  $('.footer-links').show();
});

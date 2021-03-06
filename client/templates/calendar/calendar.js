accounting.settings.currency.format = {
	pos : "%s %v", // for positive values, eg. "$ 1.00" (required)
	neg : "%s %v"  // for negative values, eg. "$ 1.00"
};

Template.calendar.onRendered(() => {
  $('#calendar').fullCalendar({
    eventColor: "transparent",
    header: {
      right: 'today basicWeek,month prev,next'
    },
    events: function(start, end, timezone, callback) {
      let data = CashFlow.find({
        start: { $lte: end.endOf('day').valueOf() }
      }, {sort: {'start': 1} }).fetch().filter((flow) => {
        return !flow.deleted;
      }).map((flow) => {
        return {
          'id': flow._id,
					'type': flow.type,
          'start': flow.start,
          'title': flow.title,
          'amount': flow.amount,
          'textColor': (flow.amount < 0) ? '#B90000' : '#5CB85C',
          'editable': true,
          'paid': flow.paid,
          'occurance': flow.occurance,
          'origin': flow.origin
        };
      });
			const displayMonth = moment(new Date($('.fc-left').text()));
			const computeTotalForType = (type, data) => {
				return _.reduce(_.filter(data, (f) => {
					const fmom = moment(f.start);
					return f.type == type && fmom.isBetween(displayMonth.clone().startOf('month'), displayMonth.clone().endOf('month'), null, '[]');
				}), (i, n) => { return i + n.amount }, 0);
			}
			const totalIncome = computeTotalForType('income', data);
			const totalExpenses = computeTotalForType('expense', data);
			Session.set('flowTotals', {
				"month": {
					"income": totalIncome,
					"expense": totalExpenses
				}
			});

      var balances = _.map(AccountBalance.find().fetch(), (bal) => {
        bal.type = 'balance',
        bal.textColor = '#999999',
        bal.editable = false;
        return bal;
      });

      callback(data.concat(balances));
    },
    eventRender: function(flow, element, view) {
			var scaffolding = `
        <div class="card">
          <div class="front"></div>
          <div class="back">
        </div>
      `;

      var content = element.find('.fc-content');
      var amount = element.find('.fc-time');
      amount.text(accounting.formatMoney(flow.amount));
      content.append(scaffolding);
      amount.remove();
      amount.appendTo(content.find('.front'));

      var wrapper = $('<span class="jm-edit-wrapper"></span>');

      /*
      var markPaid = $('<span class="glyphicon glyphicon-send" aria-hidden="true">&nbsp;</span>')
      markPaid.click(function() {
        var startPaid = flow.start.utc().startOf('day').valueOf();
        Meteor.call('markPaid', flow.id, startPaid, function(error, res) {
          if (error) {
            Bert.alert({
              type: 'danger',
              message: error,
              style: 'growl-top-right'
            });
          }
        });
      });

      var edit = $('<span class="glyphicon glyphicon-pencil" aria-hidden="true">&nbsp;</span>');
      edit.click(function() {
        Session.set('activeMoment', flow.start.utc().valueOf());
        Session.set('cashFlowModalData', {type: 'Edit', flow: flow.id});
        $('#new-cashflow-modal').modal('show');
      });

      */
      var trashHtml = `
      <a href="#delete-cashflow-modal" data-toggle="modal" data-flow-id="${flow.id}" data-flow-title="${flow.title}" data-flow-occurance="${flow.occurance}" data-flow-origin="${flow.origin}" data-flow-start="${flow.start}">
        <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
      </a>
      `
      var trash = $(trashHtml);

      //markPaid.appendTo(wrapper);
      //edit.appendTo(wrapper);
      trash.appendTo(wrapper);

      wrapper.appendTo(element.find('.back'));
      wrapper.find('.front').append(amount);

      content.find('.card').flip({
        'axis': 'x',
        'trigger': 'manual'
      });
    },
    eventOrder: [function(a,b) {
      if (a.miscProps.type === "balance") {
        return -1
      } else if (b.miscProps.type === "balance") {
        return 1
      } else {
				return b.miscProps.amount - a.miscProps.amount;
			}
    }, "-amount"],
    dayClick: function(date, jsEvent, view) {
      Session.set('activeMoment', date.valueOf());

      $(this).popover({
        html: true,
        container: 'body',
        placement: 'top',
        trigger: 'click',
        content: `
          <a href="#" data-toggle="modal" data-target="#new-cashflow-modal" data-cashflowtype="expense">Add an expense</a> |
          <a href="#" data-toggle="modal" data-target="#new-cashflow-modal" data-cashflowtype="income">Add income</a>
        `
      });
      $(this).popover('show');

      /*
       * Hide any other visible popovers once a new one has been shown.
       */
      var newest = $(this).data('bs.popover').$tip[0].id;
      _.each($('.popover'), (popover) => {
        if (popover.id !== newest) {
          $('#' + popover.id).popover('destroy');
        }
      });
    },
    eventClick: function(flow, jsevent, view) {
      $('.popover').popover('destroy');
      if (flow.type === "balance") {
        return;
      }

      var active = $(this).find('.card');
      // If the flow event we clicked is already showing its buttons
      // then we flip it back to its amount.
      if (active.hasClass('flipped')) {
        active.flip(true);
        active.removeClass('flipped');
      } else {
        // If not, then we flip any buttons being shown back to prices, flip
        // the selected one, and annotate it as flipped
        $('.flipped').flip(false);
        $('.flipped').removeClass('flipped');
        active.flip('toggle');
        active.addClass('flipped');
      }
    },
    viewRender: function(view, element) {
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
    viewDestroy: function() {
      $('.popover').popover('destroy');
    }
  });

  Tracker.autorun((runFunc) => {
    // When new expenses get added to the DB make sure we refresh the calendar
    CashFlow.direct.find().fetch();
    $('#calendar').fullCalendar('refetchEvents');
    Session.get('accountbalance');
  });
});

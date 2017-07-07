Template.calendar.onRendered(() => {
  $('#calendar').fullCalendar({
    eventColor: "transparent",
    header: {
      right: 'today basicWeek,month prev,next'
    },
    events: function(start, end, timezone, callback) {
      var bankaccount = Session.get('accountbalance') === undefined
        ? Meteor.user().profile.balance
        : Session.get('accountbalance');
      bankaccount = Number(bankaccount);

      let data = CashFlow.find({
        start: { $lte: end.endOf('day').valueOf() }
      }, {sort: {'start': 1} }).fetch().map((flow) => {
        return {
            'id': flow._id,
            'start': flow.start,
            'title': flow.title,
            'amount': flow.amount,
            'textColor': (flow.amount < 0) ? '#B90000' : '#5CB85C',
            'editable': true,
            'paid': flow.paid,
            'generated': flow.generated
          };
      });

      callback(data);
    },
    dayClick: function(date, jsEvent, view) {
      $(this).popover({
        html: true,
        container: 'body',
        placement: 'top',
        trigger: 'click',
        content: `
          <a href="#" data-toggle="modal" data-target="#new-cashflow-modal" data-monettype="expense">Add an expense</a> |
          <a href="#" data-toggle="modal" data-target="#new-cashflow-modal" data-monettype="income">Add income</a>
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
      var trash = $('<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>');
      trash.click(function() {
        Meteor.call('removeFlow', flow.id, function(error, res) {
          if (error) {
            Bert.alert({
              type: 'danger',
              message: error,
              style: 'growl-top-right'
            });
          }
        });
      })

      //markPaid.appendTo(wrapper);
      //edit.appendTo(wrapper);
      trash.appendTo(wrapper);

      wrapper.appendTo(element.find('.back'));
      wrapper.find('.front').append(amount);

      content.find('.card').flip({
        'axis': 'x'
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
    viewDestroy: function() {
      $('.popover').popover('destroy');
    }
  });
});

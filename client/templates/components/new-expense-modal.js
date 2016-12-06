const YEAR = 0;
const MONTH = 1;
const DATE = 2;
const HOUR = 3;
const MIN = 4;
const SEC = 5;
const MS = 6;
const DAY = 7;

function dateDayToWord(day) {
  switch(day) {
    case 0: return "Sunday";
    case 1: return "Monday";
    case 2: return "Tuesday";
    case 3: return "Wednesday";
    case 4: return "Thursday";
    case 5: return "Friday";
    case 6: return "Saturday";
  }
}

function dateMonthToWord(month) {
  switch(month) {
    case 1: return "January";
    case 2: return "February";
    case 3: return "March";
    case 4: return "April";
    case 5: return "May";
    case 6: return "June";
    case 7: return "July";
    case 8: return "August";
    case 9: return "September";
    case 10: return "October";
    case 11: return "November";
    case 12: return "December";
  }
}

function suffixDate(date) {
  switch(date) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    default:
      return date + "th";
  }
}

Template.newExpenseModal.events({
  'submit form': function(e) {
    e.preventDefault();

    var jdate = Session.get('activeDate');
    var start = jdate[YEAR] + "-" + jdate[MONTH] + "-" + jdate[DATE];

    var expense = {
      title: $(e.target).find('#expenseName').val(),
      amount: $(e.target).find('#expenseAmount').val(),
      start: start,
      reoccurance: {
        'freq': $(e.target).find('.tab-content .active')[0].id,
        'first': jdate
      }
    }

    Expenses.insert(expense);
    $('#new-expense-modal').modal('hide');
  }
})

Template.newExpenseModal.helpers({
  'reoccursYearDate': function() {
    jdate = Session.get('activeDate');
    if (jdate != undefined)
      return suffixDate(jdate[DATE]) + " of " + dateMonthToWord(jdate[MONTH]);
  },
  'reoccursMonthDate': function() {
    jdate = Session.get('activeDate')
    if (jdate != undefined)
      return suffixDate(jdate[DATE]);
  },
  'reoccursWeekDate': function() {
    jdate = Session.get('activeDate');
    if (jdate != undefined)
      return dateDayToWord(jdate[DAY]);
  }
});

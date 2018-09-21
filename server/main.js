import { Meteor } from 'meteor/meteor';
import _ from 'lodash';

Meteor.startup(() => {
  process.env.MAIL_URL = _.get(Meteor.settings, "private.MAIL_URL", "");
});

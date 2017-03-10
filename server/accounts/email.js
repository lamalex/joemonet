Accounts.emailTemplates.siteName = "JoeMonet";
Accounts.emailTemplates.from = "Joe Monet <joe@welcome.joemonet.com>"
Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "Verify yourself on Joe Monet (or ELSE)";
  },
  text(user, url) {
    //var emailAddress = user.emails[0].address,
    return `
    WELCOME to JoeMonet. A crappy on-line check book balancer.
    Please verify yourself and enjoy JoeMonet.

    ${url}

    If you did not sign up for JoeMonet, then please ignore this message.
    `
  }
}

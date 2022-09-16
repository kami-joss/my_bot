module.exports = class Animal {
  constructor(user) {
    this.user = user;
    // this.webhookEvent = webhookEvent;
  }

  handlePayload(payload) {
    switch (payload) {
      case "want_cat":
        return [
          {
            messaging_type: "RESPONSE",
            message: {
              text: `Ok ${this.user.first_name}, On va te trouver ça ;)`,
            },
          },
          {
            messaging_type: "RESPONSE",
            message: {
              text: `Let's go !`,
            },
          },
        ];
    }
  }
};

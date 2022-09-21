const animals = require("../animals");

module.exports = class Animal {
  constructor(user) {
    this.user = user;
    this.type = null;
    this.name = null;
    // this.webhookEvent = webhookEvent;
  }

  presentAnimals() {
    let animalList = animals[this.type].map((animal) => {
      return {
        title: animal.name,
        subtitle: animal.desc,
        image_url: animal.image,
        buttons: [
          {
            type: "web_url",
            url: "https://www.la-spa.fr/adoption/",
            title: "En savoir plus",
          },
          {
            type: "postback",
            title: `Adopter ${animal.name}`,
            payload: `choice:${animal.name}`,
          },
        ],
      };
    });
    animalList = [
      ...animalList,
      {
        title: "Aucun de ces animaux ne me convient",
        buttons: [
          {
            type: "web_url",
            url: "https://www.la-spa.fr/adoption/",
            title: "En savoir plus",
          },
          {
            type: "postback",
            title: `Aucun de ces animaux ne me convient`,
            payload: `no_animal`,
          },
        ],
      },
    ];
    return animalList;
  }

  async handlePayload(payload) {
    switch (payload) {
      case "want_cat":
        this.type = "cats";
        return [
          {
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: this.presentAnimals(),
                },
              },
            },
          },
        ];

      case "want_dog":
        this.type = "dogs";
        return [
          {
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: this.presentAnimals(),
                },
              },
            },
          },
        ];

      case "animal:adopted":
        return [
          {
            messaging_type: "RESPONSE",
            message: {
              text: "Pas de quoi ! :)",
            },
          },
          {
            messaging_type: "RESPONSE",
            message: {
              text: `Veux-tu parler d'autre chose ?`,
              quick_replies: [
                {
                  content_type: "text",
                  title: "J'aimerais adopter un animal",
                  payload: "animal",
                },
                {
                  content_type: "text",
                  title: "Rien pour le moment",
                  payload: "nothing",
                },
              ],
            },
          },
        ];

      case "unvalidate_choice":
        return [
          {
            messaging_type: "RESPONSE",
            message: {
              text: "Pas de soucis !",
            },
          },
          {
            messaging_type: "RESPONSE",
            message: {
              text: `Je peux faire autre chose pour toi ?`,
              quick_replies: [
                {
                  content_type: "text",
                  title: "J'aimerais adopter un animal",
                  payload: "animal",
                },
                {
                  content_type: "text",
                  title: "Rien pour le moment",
                  payload: "nothing",
                },
              ],
            },
          },
        ];

      case "validate_choice": {
        const animalIndex = animals[this.type].findIndex(
          (animal) => animal.name === this.name
        );
        const animal = animals[this.type][animalIndex];
        animals[this.type].splice(animalIndex, 1);
        return [
          {
            messaging_type: "RESPONSE",
            message: {
              text: `Tu as choisi ${this.name}! Tu peux le retrouver à la SPA de ${animal.position} :)`,
              quick_replies: [
                {
                  content_type: "text",
                  title: "Au top ! Merci !",
                  payload: "animal:adopted",
                },
                {
                  content_type: "text",
                  title: "Arrêter la conversation",
                  payload: "nothing",
                },
              ],
            },
          },
        ];
      }

      case "no_animal": {
        return [
          {
            messaging_type: "RESPONSE",
            message: {
              text: `Malheureusement, je n'ai pas d'autre proposition pour le moment :(`,
            },
          },
          {
            messaging_type: "RESPONSE",
            message: {
              text: `Tu veux parler d'autre chose ?`,
              quick_replies: [
                {
                  content_type: "text",
                  title: "J'aimerais adopter un animal",
                  payload: "animal",
                },
                {
                  content_type: "text",
                  title: "Rien pour le moment",
                  payload: "nothing",
                },
              ],
            },
          },
        ];
      }
    }

    if (payload.startsWith("choice:")) {
      this.name = payload.split(":")[1];
      return {
        messaging_type: "RESPONSE",
        message: {
          text: `Tu es sûr de vouloir ${this.name}?`,
          quick_replies: [
            {
              content_type: "text",
              title: "Oui !",
              payload: "validate_choice",
            },
            {
              content_type: "text",
              title: "Je vais réfléchir",
              payload: "unvalidate_choice",
            },
          ],
        },
      };
    }
  }
};

/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `yarn install`
 * 3. Add your VERIFY_TOKEN and PAGE_ACCESS_TOKEN to your environment vars
 */

"use strict";
const axios = require("axios");
const Animal = require("../Themes/animal");
// Use dotenv to read .env vars into Node
require("dotenv").config();

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  { urlencoded, json } = require("body-parser"),
  app = express();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let theme;

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond with 'Hello World' when a GET request is made to the homepage
app.get("/", function (_req, res) {
  res.send("Hello World");
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body;
  console.log("test webhook");
  res.send("ok");

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      // console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      let recipientId = webhookEvent.recipient.id;

      console.log(webhookEvent);

      if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      } else if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      }
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      //     if (webhookEvent.message) {
      //       handleMessage(senderPsid, webhookEvent.message, recipientId);
      //     } else if (webhookEvent.postback) {
      //       handlePostback(senderPsid, webhookEvent.postback);
      //     }
      //   });

      //   // Returns a '200 OK' response to all requests
      //   res.status(200).send("EVENT_RECEIVED");
      // } else {
      //   // Returns a '404 Not Found' if event is not from a page subscription
      //   res.sendStatus(404);
      // }
    });
  }
});

async function firstTrait(nlp, name) {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}

async function handleQuickReply(senderPsid, quickReply) {
  let response;
  let payload = quickReply.payload;
  const user = await getUserData(senderPsid);

  if (user) {
    if (theme === "animal") {
      let theme = new Animal(user);
      response = theme.handlePayload(payload);
      console.log(response);
      response.forEach((res) => callSendAPI(senderPsid, res));
    }

    if (payload === "animal") {
      theme = "animal";
      response = {
        messaging_type: "RESPONSE",
        message: {
          text: `Ok ${user.first_name}, je vais te poser quelques questions pour trouver le bon animal pour toi !`,
        },
      };
      callSendAPI(senderPsid, response);

      response = {
        messaging_type: "RESPONSE",
        message: {
          text: `Quel type d'animal recherches-tu ?`,
          quick_replies: [
            {
              content_type: "text",
              title: "Chien",
              payload: "want_dog",
            },
            {
              content_type: "text",
              title: "Chat",
              payload: "want_cat",
            },
          ],
        },
      };
      callSendAPI(senderPsid, response);
    } else if (payload === "nothing") {
      response = {
        messaging_type: "RESPONSE",
        message: {
          text: `Ok ${user.first_name}, à bientôt !`,
        },
      };
    }
  }
}

// Handles messages events
async function handleMessage(senderPsid, message, recipientId) {
  let response;

  if (message.quick_reply) {
    handleQuickReply(senderPsid, message.quick_reply);
  }

  // Checks if the message contains text

  // if (message.text && res) {
  //   if (message.text.toLowerCase() == "hey my bot") {
  //     response = {
  //       text: `Hey ${userData.first_name}!`,
  //     };
  //     await callSendAPI(senderPsid, response);
  //     callSendAPI(senderPsid, {
  //       // messaging_type: "RESPONSE",
  //       message: {
  //         text: "Pick a color:",
  //         quick_replies: [
  //           {
  //             content_type: "text",
  //             title: "Red",
  //             payload: "<POSTBACK_PAYLOAD>",
  //             // image_url: "http://example.com/img/red.png",
  //           },
  //           {
  //             content_type: "text",
  //             title: "Green",
  //             payload: "<POSTBACK_PAYLOAD>",
  //             // image_url: "http://example.com/img/green.png",
  //           },
  //         ],
  //       },
  //     });
  //   } else {
  //     response = {
  //       text: `Désolé je n'ai pas compris votre message`,
  //     };
  //   }

  //   // Create the payload for a basic text message, which
  //   // will be added to the body of your request to the Send API
  // } else if (message.attachments) {
  //   // Get the URL of the message attachment
  //   let attachmentUrl = message.attachments[0].payload.url;
  //   response = {
  //     attachment: {
  //       type: "template",
  //       payload: {
  //         template_type: "generic",
  //         elements: [
  //           {
  //             title: "Is this the right picture?",
  //             subtitle: "Tap a button to answer.",
  //             image_url: attachmentUrl,
  //             buttons: [
  //               {
  //                 type: "postback",
  //                 title: "Yes!",
  //                 payload: "yes",
  //               },
  //               {
  //                 type: "postback",
  //                 title: "No!",
  //                 payload: "no",
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     },
  //   };
  // }

  // Send the response message
  // if (response) {
  //   callSendAPI(senderPsid, response);
  // }
}

// Handles messaging_postbacks events
async function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;
  const user = await getUserData(senderPsid);

  // Set the response based on the postback payload
  if (user) {
    if (payload === "get_started") {
      response = {
        messaging_type: "RESPONSE",
        message: {
          text: `Hey ${user.first_name}! On parle de quoi aujourd'hui ?`,
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
      };
    } else if (payload === "no") {
      response = { text: "Oops, try sending another image." };
    }
    // Send the message to acknowledge the postback
    callSendAPI(senderPsid, response);
  }
}

// Sends response messages via the Send API
async function callSendAPI(senderPsid, response) {
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // Construct the message body
  let requestBody = {
    recipient: {
      id: senderPsid,
    },
    ...response,
  };

  const senderAction = await axios
    .post(
      "https://graph.facebook.com/v2.6/me/messages?access_token=" +
        PAGE_ACCESS_TOKEN,
      {
        recipient: {
          id: senderPsid,
        },
        sender_action: "typing_on",
      }
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {});

  // Send the HTTP request to the Messenger Platform
  if (senderAction) {
    request(
      {
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: requestBody,
      },
      (err, _res, _body) => {
        if (!err) {
          console.log("Message sent!");
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
  }
}

function getUserData(id) {
  return axios
    .get(
      "https://graph.facebook.com/" +
        id +
        "?fields=first_name,last_name&access_token=" +
        PAGE_ACCESS_TOKEN
    )
    .then((res) => {
      return res.data;
    });
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

// curl -X GET "https://graph.facebook.com/5569789083059431?access_token=EAAF16F2sEygBADB29FaeLHj6A1jWFZA8KVuFCikcLtVQESQWgCOEDZCDAWEOv5TQZCZAAEtP0dQEYUZAfeDJu0JjY7BauIzFvPHFwwkP3ZBo2coZBAomhcwZC5MzZBsJPJZBgqnvC1ktIJuDB2naGZBo6iE1mkrDZCNZC4HHYYzCtZAGpLsfNwAHJLxT2Y"

// curl -i -X POST "https://graph.facebook.com/me/nlp_configs?nlp_enabled=true&model=ENGLISH&access_token=EAAF16F2sEygBADB29FaeLHj6A1jWFZA8KVuFCikcLtVQESQWgCOEDZCDAWEOv5TQZCZAAEtP0dQEYUZAfeDJu0JjY7BauIzFvPHFwwkP3ZBo2coZBAomhcwZC5MzZBsJPJZBgqnvC1ktIJuDB2naGZBo6iE1mkrDZCNZC4HHYYzCtZAGpLsfNwAHJLxT2Y"

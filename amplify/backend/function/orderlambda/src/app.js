/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const AWS = require("aws-sdk");
const { convertCentsToDollar } = require("../../../../../src/utils");

const config = {
  region: "us-east-1",
  adminEmail: "vasylpb89@gmail.com",
  accessKeyId: process.env.ACCESS_SECRET_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

const SES = new AWS.SES(config);

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/****************************
 * Example post method *
 ****************************/

const chargeHandler = async (req, res, next) => {
  const {
    token,
    charge: { currency, amount, description },
    email,
  } = req.body;
  try {
    const charge = await stripe.charges.create({
      source: token.id,
      amount,
      currency,
      description,
    });
    if (charge.status === "succeeded") {
      req.charge = charge;
      req.description = description;
      req.email = email;
      next();
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const emailHandler = (req, res) => {
  const {
    charge,
    description,
    email: { shipped, customerEmail, ownerEmail },
  } = req;

  SES.sendEmail(
    {
      Source: config.adminEmail,
      ReturnPath: config.adminEmail,
      Destination: {
        ToAddresses: [config.adminEmail],
      },
      Message: {
        Subject: {
          Data: "Order Details - AmplifyAgora",
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <h3>Order Processed!</h3>
              <p><strong>${description}</strong> - $ ${convertCentsToDollar(charge.amount)}</p>
              <p>Customer Email: <a href="mailto:${customerEmail}">${customerEmail}</a></p>
              <p>Contact your seller: <a href="mailto:${ownerEmail}">${ownerEmail}</a></p>
              ${
                shipped
                  ? `
                    <h4>Mailing Address</h4>
                    <p>${charge.source.name}</p>
                    <p>${charge.source.address_line1}</p>
                    <p>${charge.source.address_city}, ${charge.source.address_state}, ${charge.source.address_zip} </p>
                  `
                  : "Emailed product"
              }
              <p style="font-style: italic; color: grey;">
                ${
                  shipped
                    ? "Your product will be shipped in 2-3 days"
                    : "Check your verified email for your emailed product"
                }
              </p>
            `,
          },
        },
      },
    },
    (error, data) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.json({
        message: "Order processed successfully!",
        charge,
        data,
      });
    }
  );
};

app.post("/charge", chargeHandler, emailHandler);

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;

import React from "react";
import { API } from "aws-amplify";
import StripeCheckout from "react-stripe-checkout";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
};

const PayButton = ({ product, user }) => {
  const handleCharge = async (token) => {
    try {
      const result = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
        },
      });
      console.log("result", result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      name={product.description}
      email={user.attributes.email}
      amount={Number(product.price)}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;

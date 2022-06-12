import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../graphql/queries";
import StripeCheckout from "react-stripe-checkout";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
};

const PayButton = ({ product, user }) => {
  const getOwnerEmail = async ownerId => {
    const result = await API.graphql(
      graphqlOperation(getUser, { id: ownerId })
    );
    return result.data.getUser.email;
  };

  const handleCharge = async token => {
    const ownerEmail = await getOwnerEmail(product.owner);
    try {
      const result = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
          email: {
            customerEmail: user.attributes.email,
            shipped: product.shipped,
            ownerEmail,
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

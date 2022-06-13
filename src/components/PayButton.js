import React from "react";
import { useHistory } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import { toast } from "react-toastify";
import { getUser } from "../graphql/queries";
import { createOrder } from "../graphql/mutations";
import StripeCheckout from "react-stripe-checkout";
import { ORDER_STATUS } from "../constants";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
};

const PayButton = ({ product, user }) => {
  const history = useHistory();

  const getOwnerEmail = async ownerId => {
    const result = await API.graphql(
      graphqlOperation(getUser, { id: ownerId })
    );
    return result.data.getUser.email;
  };

  const createShippingAddress = source => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip,
  });

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
      if (result.charge.status === ORDER_STATUS.success) {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(result.charge.source);
        }
        const input = {
          userId: user.attributes.sub,
          productId: product.id,
          shippingAddress,
        };
        const order = await API.graphql(
          graphqlOperation(createOrder, { input })
        );
        console.log({ order });
        toast.success(`${result.message}`, {
          onClose: () => {
            history.push("/");
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(`${error.message || "Error processing order"}`);
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

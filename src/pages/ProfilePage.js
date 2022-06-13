import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Icon } from "react-icons-kit";
import { profile } from "react-icons-kit/icomoon/profile";
import { cart } from "react-icons-kit/icomoon/cart";
import {
  Tabs,
  TabItem,
  Heading,
  Text,
  Card,
  Collection,
  // Table,
  // TableCell,
  // TableBody,
  // TableHead,
  // TableRow,
} from "@aws-amplify/ui-react";
import { convertCentsToDollar } from "../utils";

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders {
        items {
          id
          userId
          productId
          createdAt
          updatedAt
          owner
          product {
            id
            owner
            price
            createdAt
            description
          }
          shippingAddress {
            city
            country
            address_line
            address_state
            address_zip
          }
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;

const ProfilePage = ({ user }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      getUserOrders(user.attributes.sub);
    }
  }, [user]);

  const getUserOrders = async userId => {
    const input = { id: userId };
    const result = await API.graphql(graphqlOperation(getUser, input));
    console.log("result", result);
    setOrders(result.data.getUser.orders.items);
  };

  return (
    <Tabs defaultIndex={0} justifyContent="center">
      <TabItem
        title={
          <>
            <Icon icon={profile} /> Summary
          </>
        }
      >
        <Heading level={3} className="heading-blue">
          Profile summary
        </Heading>
      </TabItem>
      <TabItem
        title={
          <>
            <Icon icon={cart} /> Orders
          </>
        }
      >
        <Heading level={3} className="heading-blue">
          Order history
        </Heading>

        <Collection
          type="list"
          items={orders}
          direction="row"
          justifyContent="space-between"
          wrap="wrap"
        >
          {(order, index) => (
            <Card key={index} maxWidth="400px" variation="elevated">
              <Heading level={4}>{order.product.description}</Heading>
              <Text>
                <strong> Order Id:</strong> {order.id}
              </Text>
              <Text>
                <strong>Price:</strong>{" "}
                {convertCentsToDollar(order.product.price)}
              </Text>
              <Text>
                <strong>Purchased on:</strong> {order.createdAt}
              </Text>
              {order.shippingAddress && (
                <>
                  Shipping Address
                  <div className="ml-2">
                    <p>{order.shippingAddress.address_line}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state},{" "}
                      {order.shippingAddress.country},
                      {order.shippingAddress.address_zip}
                    </p>
                  </div>
                </>
              )}
            </Card>
          )}
        </Collection>
      </TabItem>
    </Tabs>
  );
};

export default ProfilePage;

import React, { useEffect, useState, useContext } from "react";
import { withRouter, Link } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import { Icon } from "react-icons-kit";
import { onCreateProduct, onDeleteProduct } from "../graphql/subscriptions";
import { circleLeft } from "react-icons-kit/iconic/circleLeft";
import { list2 } from "react-icons-kit/icomoon/list2";
import { plus } from "react-icons-kit/icomoon/plus";
import {
  Grid,
  Heading,
  Loader,
  Tabs,
  TabItem,
  useAuthenticator,
  Badge,
} from "@aws-amplify/ui-react";
import Product from "../components/Product";
import NewProduct from "../components/NewProduct";
import { formatProductDate } from "../utils";
import { UserContext } from "../providers/UserProvider";

const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 999) {
        items {
          id
          marketId
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;

const MarketPage = props => {
  const [market, setMarket] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const { marketId } = props.match.params;

  const { userAttributes } = useContext(UserContext);

  const { user } = useAuthenticator(context => [context.user]);

  const handleGetMarket = async () => {
    const result = await API.graphql(
      graphqlOperation(getMarket, { id: marketId })
    );
    setMarket(result.data.getMarket);
    setLoading(false);
  };

  useEffect(() => {
    handleGetMarket();
    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct, {
        owner: user.username,
        input: { owner: user.username },
      })
    ).subscribe({
      next: ({ provider, value }) => {
        setMarket(prevMarket => ({
          ...prevMarket,
          products: {
            ...prevMarket.products,
            items: [value.data.onCreateProduct, ...prevMarket.products.items],
          },
        }));
        setTabIndex(0);
      },
    });
    const deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct, {
        owner: user.username,
        input: { owner: user.username },
      })
    ).subscribe({
      next: ({ provider, value }) => {
        setMarket(prevMarket => {
          const deletedProduct = value.data.onDeleteProduct;
          const updatedProducts = prevMarket.products.items.filter(
            item => item.id !== deletedProduct.id
          );
          return {
            ...prevMarket,
            products: {
              ...prevMarket.products,
              items: [...updatedProducts],
            },
          };
        });
        setTabIndex(0);
      },
    });
    return () => {
      createProductListener.unsubscribe();
      deleteProductListener.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <Loader size="large" />;
  }
  const isMarketOwner = user && userAttributes.sub === market.owner;

  const isEmailVerified = user && userAttributes.email_verified;

  const products = market.products.items;

  return (
    <>
      <Link className="link" to="/">
        <Icon icon={circleLeft} />
        <span style={{ marginLeft: "8px" }}>Back to Markets List</span>
      </Link>

      <div className="items-center pt-2">
        <Heading level={3}>{market.name}</Heading> - {market.owner}
      </div>
      <div className="items-center pt-2">
        <span style={{ color: "lightsteelblue" }}>
          {formatProductDate(market.createdAt)}
        </span>
      </div>
      <Tabs
        justifyContent="center"
        currentIndex={tabIndex}
        onChange={index => setTabIndex(index)}
      >
        {products.length > 0 && (
          <TabItem
            title={
              <>
                <Icon icon={list2} /> Product List{" "}
                <Badge size="small" variation="info">
                  {products.length}
                </Badge>
              </>
            }
          >
            <Grid templateColumns="1fr 1fr 1fr" columnGap="2rem">
              {products.map(product => (
                <Product key={product.id} product={product} />
              ))}
            </Grid>
          </TabItem>
        )}
        {isMarketOwner && (
          <TabItem
            title={
              <>
                <Icon icon={plus} />
                Add New Product
              </>
            }
          >
            {isEmailVerified ? (
              <NewProduct marketId={marketId} />
            ) : (
              <Link className="link" to="/profile">
                Verify Your Email Before Adding Products
              </Link>
            )}
          </TabItem>
        )}
      </Tabs>
    </>
  );
};

export default withRouter(MarketPage);

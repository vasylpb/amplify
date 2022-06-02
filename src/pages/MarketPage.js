import React, { useEffect, useState } from "react";
import { withRouter, Link } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import { Icon } from "react-icons-kit";
import { circleLeft } from "react-icons-kit/iconic/circleLeft";
import { Heading, Loader, Tabs, TabItem } from "@aws-amplify/ui-react";
import Product from "../components/Product";
import NewProduct from "../components/NewProduct";
import { getMarket } from "../graphql/queries";

const MarketPage = (props) => {
  const [market, setMarket] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const { marketId } = props.match.params;

  const handleGetMarket = async () => {
    const result = await API.graphql(
      graphqlOperation(getMarket, { id: marketId })
    );
    setMarket(result.data.getMarket);
    setLoading(false);
  };

  useEffect(() => {
    handleGetMarket();
  }, []);

  if (isLoading) {
    return <Loader size="large" />;
  }

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
        <span style={{ color: "lightsteelblue" }}>{market.createdAt}</span>
      </div>

      <Tabs justifyContent="flex-start">
        <TabItem title="Add New Product">
          <NewProduct />
        </TabItem>
        {products.length > 0 && (
          <TabItem title={`Product List ${products.length}`}>
            <div className="product-list">
              {products.map((product) => (
                <Product product={product} />
              ))}
            </div>
          </TabItem>
        )}
      </Tabs>
    </>
  );
};

export default withRouter(MarketPage);

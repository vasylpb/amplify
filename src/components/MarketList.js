import React, { useEffect, useState } from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import {
  Loader,
  Card,
  Grid,
  Link,
  Badge,
  Flex,
  TextField,
  IconSearch,
  FieldGroupIcon,
  FieldGroupIconButton,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import { Icon } from "react-icons-kit";
import { cart } from "react-icons-kit/icomoon/cart";
import { listMarkets, searchMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";

const MarketList = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setSearching] = useState(false);

  const { user } = useAuthenticator(context => [context.user]);

  const getMarkets = async () => {
    const response = await API.graphql(graphqlOperation(listMarkets));
    setMarkets(response.data.listMarkets.items);
    setLoading(false);
  };

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateMarket, {
        owner: user.username,
        input: { owner: user.username },
      })
    ).subscribe({
      next: ({ provider, value }) =>
        setMarkets(prevMarkets => [...prevMarkets, value.data.onCreateMarket]),
      error: error => console.warn(error),
    });
    getMarkets();
    return () => {
      subscription.unsubscribe();
    };
  }, [user.username]);

  const handleSearchTerm = event => {
    setSearchTerm(event.currentTarget.value);
  };

  const handleSearch = async () => {
    if (searchTerm === "") {
      getMarkets();
      return;
    }
    try {
      setSearching(true);
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { tags: { match: searchTerm } },
            ],
          },
          sort: {
            field: "id",
            direction: "desc",
          },
        })
      );
      setMarkets(result.data.searchMarkets.items);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return <Loader size="large" />;
  }

  return (
    <>
      <h2 className="header">Markets</h2>
      <div style={{ width: "25%", marginBottom: "30px" }}>
        <TextField
          placeholder="Search markets..."
          value={searchTerm}
          onChange={handleSearchTerm}
          innerEndComponent={
            isSearching ? (
              <FieldGroupIcon>
                <Loader />
              </FieldGroupIcon>
            ) : (
              <FieldGroupIconButton onClick={handleSearch}>
                {<IconSearch />}
              </FieldGroupIconButton>
            )
          }
        />
      </div>
      <Grid templateColumns="1fr 1fr 1fr" columnGap="2.5rem" rowGap="3rem">
        {markets.map(market => (
          <Card key={market.id} variation="elevated">
            <Flex>
              <span style={{ color: "#F4A261", marginRight: "10px" }}>
                <Icon icon={cart} />
              </span>
              <Link as={ReactRouterLink} to={`/markets/${market.id}`}>
                {market.name.toUpperCase()}
              </Link>
              <span style={{ color: "var(--amplify-colors-orange-80)" }}>
                {market.products.items?.length}
              </span>
            </Flex>
            <div>{market.owner}</div>
            {Array.isArray(market.tags) &&
              market.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
          </Card>
        ))}
      </Grid>
    </>
  );
};

export default MarketList;

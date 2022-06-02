import React, { useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import {
  Button,
  TextField,
  useAuthenticator,
  SelectField,
} from "@aws-amplify/ui-react";
import { Icon } from "react-icons-kit";
import { pencil } from "react-icons-kit/icomoon/pencil";
import { createMarket } from "../graphql/mutations";

const options = ["Arts", "Crafts", "Entertainment"];

const NewMarket = () => {
  const [marketName, setMarketName] = useState("");

  const [tags, setTags] = useState("");

  const { user } = useAuthenticator((context) => [context.user]);

  const handleAddMarket = async () => {
    try {
      await API.graphql(
        graphqlOperation(createMarket, {
          input: { name: marketName, owner: user.username, tags },
        })
      );
      setMarketName("");
    } catch (error) {
      alert(error.message || "Error adding market");
    }
  };

  return (
    <>
      <div className="market-header">
        <h1 className="market-title">Create Your MarketPlace</h1>
        <Button className="market-title-button" variation="link">
          <Icon icon={pencil} size={32} />
        </Button>
      </div>

      <div style={{ width: "70%" }}>
        <div style={{ marginBottom: "20px" }}>
          <TextField
            label="Add Market Name"
            placeholder="Market name"
            onChange={(e) => setMarketName(e.currentTarget.value)}
            value={marketName}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <SelectField
            label="Market tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          >
            {options.map((tag) => (
              <option value={tag}>{tag}</option>
            ))}
          </SelectField>
        </div>
        <div>
          <Button
            variation="primary"
            disabled={!marketName}
            onClick={handleAddMarket}
          >
            Create Market
          </Button>
        </div>
      </div>
    </>
  );
};

export default NewMarket;

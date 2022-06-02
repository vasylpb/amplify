import React, { useState } from "react";
import {
  useAuthenticator,
  Button,
  TextField,
  RadioGroupField,
  Radio,
  Flex,
  View,
} from "@aws-amplify/ui-react";

import { AmplifyS3ImagePicker } from "@aws-amplify/ui-react/legacy";

const NewProduct = () => {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [isShipped, setShipped] = useState("false");
  const [image, setImage] = useState(null);
  const [isUploading, setUploading] = useState(false);

  const { user } = useAuthenticator((context) => [context.user]);

  const handleAddProduct = async () => {};

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <Flex justifyContent="space-around" style={{ width: "100%" }}>
        <View>
          <TextField
            label="Add Product Description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            type="text"
            label="Set Product Price"
            placeholder="Price ($USD)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <RadioGroupField
            name="status"
            value={isShipped}
            label="Is the Product Shipped or Emailed to the Customer?"
            onChange={(e) => setShipped(e.target.value)}
          >
            <Radio value="true">Shipped</Radio>
            <Radio value="false">Emailed</Radio>
          </RadioGroupField>
        </View>
        <View>
          <AmplifyS3ImagePicker
            headerTitle="Product Image"
            level="public"
            fileToKey={(data) => {
              console.log("fileToKey", data);
              setImage(data);
            }}
          />
        </View>
      </Flex>
      <Flex>
        <Button
          variation="primary"
          disabled={!price || !description}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
      </Flex>
    </div>
  );
};

export default NewProduct;

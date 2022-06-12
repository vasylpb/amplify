import React, { useState } from "react";
import {
  Card,
  Button,
  Flex,
  useAuthenticator,
  IconClose,
  IconSave,
  View,
  TextField,
  RadioGroupField,
  Radio,
} from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import { updateProduct, deleteProduct } from "../graphql/mutations";
import { AmplifyS3Image } from "@aws-amplify/ui-react/legacy";
import Modal from "react-modal";
import { Icon } from "react-icons-kit";
import { mail2, boxAdd } from "react-icons-kit/icomoon";
import { convertCentsToDollar, convertDollarsToCents } from "../utils";
import PayButton from "./PayButton";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const Product = ({ product }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [shipped, setShipped] = useState("false");

  const { user } = useAuthenticator(context => [context.user]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const afterOpenModal = () => {
    setDescription(product.description);
    setShipped(String(product.shipped));
    setPrice(convertCentsToDollar(product.price));
  };

  const handleUpdateProduct = async id => {
    try {
      closeModal();
      const input = {
        id,
        shipped,
        description,
        price: convertDollarsToCents(price),
      };
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log("result", result);
    } catch (error) {
      console.error(`Failed to update product with id ${id}`, error);
    }
  };

  const handleDeleteProduct = async id => {
    try {
      await API.graphql(graphqlOperation(deleteProduct, { input: { id } }));
    } catch (error) {
      console.error(`Failed to delete product with id ${id}`, error);
    }
  };

  const isProductOwner = user && user.attributes.sub === product.owner;

  return (
    <>
      <Card variation="elevated" style={{ width: "100%" }}>
        <AmplifyS3Image imgKey={product.file.key} />
        <div className="card-body">
          <h3>{product.description}</h3>
          <div className="items-center">
            <Icon icon={product.shipped ? boxAdd : mail2} />
            <span style={{ marginLeft: "5px" }}>
              {product.shipped ? "Shipped" : "Emailed"}
            </span>
          </div>
          <div className="text-right">
            <span className="mx-1">
              $ {convertCentsToDollar(product.price)}
            </span>
          </div>
        </div>
        <Flex justifyContent="space-between">
          {isProductOwner && (
            <div>
              <Button onClick={openModal}>Update</Button>
              <Button
                onClick={() => handleDeleteProduct(product.id)}
                style={{
                  backgroundColor: "tomato",
                  color: "white",
                  border: "none",
                  marginLeft: "10px",
                }}
              >
                Delete
              </Button>
            </div>
          )}
          {!isProductOwner && <PayButton product={product} user={user} />}
        </Flex>
      </Card>
      <Modal
        isOpen={modalIsOpen}
        style={customStyles}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
      >
        <View width="20rem">
          <h3>Update Product</h3>
          <TextField
            label="Update Description"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <TextField
            type="number"
            label="Update Price"
            placeholder="Price ($USD)"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <RadioGroupField
            name="status"
            label="Update shipping"
            value={shipped}
            onChange={e => setShipped(e.target.value)}
          >
            <Radio value="true">Shipped</Radio>
            <Radio value="false">Emailed</Radio>
          </RadioGroupField>
          <Flex style={{ marginTop: "40px" }}>
            <Button
              variation="primary"
              onClick={() => handleUpdateProduct(product.id)}
            >
              <IconSave />
              Save
            </Button>
            <Button onClick={closeModal}>
              <IconClose />
              Cancel
            </Button>
          </Flex>
        </View>
      </Modal>
    </>
  );
};

export default Product;

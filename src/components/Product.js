import React, { useState, useContext } from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import {
  Card,
  Button,
  Flex,
  useAuthenticator,
  TextField,
  RadioGroupField,
  Radio,
  Link,
} from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import { toast } from "react-toastify";
import { updateProduct, deleteProduct } from "../graphql/mutations";
import { AmplifyS3Image } from "@aws-amplify/ui-react/legacy";
import Modal from "../components/Modal";
import { Icon } from "react-icons-kit";
import { mail2, boxAdd } from "react-icons-kit/icomoon";
import { convertCentsToDollar, convertDollarsToCents } from "../utils";
import PayButton from "./PayButton";
import { UserContext } from "../providers/UserProvider";

const Product = ({ product }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [shipped, setShipped] = useState("false");

  const { userAttributes } = useContext(UserContext);

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
      toast.success("Procuct updated!");
    } catch (error) {
      console.error(`Failed to update product with id ${id}`, error);
      toast.error("Failed to update product!");
    }
  };

  const handleDeleteProduct = async id => {
    try {
      await API.graphql(graphqlOperation(deleteProduct, { input: { id } }));
      toast.success("Procuct deleted!");
    } catch (error) {
      console.error(`Failed to delete product with id ${id}`, error);
      toast.error("Failed to delete product!");
    }
  };

  const isProductOwner = user && userAttributes.sub === product.owner;

  const isEmailVerified = user && userAttributes.email_verified;

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
          {isEmailVerified ? (
            !isProductOwner && <PayButton product={product} user={user} />
          ) : (
            <Link as={ReactRouterLink} to="/profile">
              Verify Email
            </Link>
          )}
        </Flex>
      </Card>
      <Modal
        isOpen={modalIsOpen}
        title="Update Product"
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        save={handleUpdateProduct}
      >
        <>
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
        </>
      </Modal>
    </>
  );
};

export default Product;

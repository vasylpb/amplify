import React, { useState } from "react";
import {
  useAuthenticator,
  Button,
  TextField,
  RadioGroupField,
  Radio,
  Flex,
  View,
  Image,
  Loader,
} from "@aws-amplify/ui-react";
import { Storage, API, graphqlOperation } from "aws-amplify";
import { toast } from "react-toastify";
import ImageUploading from "react-images-uploading";
import aws_exports from "../aws-exports";
import { createProduct } from "../graphql/mutations";
import { convertDollarsToCents } from "../utils";

const NewProduct = ({ marketId }) => {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [shipped, setShipped] = useState("false");
  const [image, setImage] = useState(null);
  const [isLoading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { user } = useAuthenticator(context => [context.user]);

  const handleAddProduct = async () => {
    setUploading(true);
    try {
      const visibility = "public";
      const uploadedImage = image[0];
      const filename = `/${visibility}/${user.username}/${Date.now()}-${
        uploadedImage.file.name
      }`;
      const uploadedFile = await Storage.put(filename, uploadedImage.file, {
        contentType: uploadedImage.file.type,
        progressCallback: progress => {
          const percentUploaded = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setProgress(percentUploaded);
        },
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region,
      };
      const input = {
        marketId: marketId,
        description,
        shipped,
        price: convertDollarsToCents(price),
        file,
      };

      await API.graphql(graphqlOperation(createProduct, { input }));
      toast.success("Procuct added!");
    } catch (e) {
      console.error("Error adding product", e);
      toast.error("Error adding product!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      {progress > 0 && isLoading && (
        <div style={{ marginBottom: "20x" }}>
          <Loader variation="linear" percentage={progress} isDeterminate />
        </div>
      )}
      <Flex justifyContent="space-around" style={{ width: "100%" }}>
        <View>
          <TextField
            label="Add Product Description"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <TextField
            type="text"
            label="Set Product Price"
            placeholder="Price ($USD)"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <RadioGroupField
            name="status"
            value={shipped}
            label="Is the Product Shipped or Emailed to the Customer?"
            onChange={e => setShipped(e.target.value)}
          >
            <Radio value="true">Shipped</Radio>
            <Radio value="false">Emailed</Radio>
          </RadioGroupField>
          <div style={{ marginTop: "40px" }}>
            <Button
              variation="primary"
              disabled={!price || !description || !image || isLoading}
              onClick={handleAddProduct}
            >
              {isLoading ? "Loading..." : "Add Product"}
            </Button>
          </div>
        </View>
        <View width={"25%"}>
          <ImageUploading value={image} onChange={data => setImage(data)}>
            {({ imageList, onImageUpload }) => (
              <>
                {imageList.length > 0 && (
                  <Image
                    src={imageList[0].dataURL}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    objectPosition="50% 50%"
                  />
                )}
                <Button onClick={onImageUpload} isFullWidth>
                  Upload Image
                </Button>
              </>
            )}
          </ImageUploading>
        </View>
      </Flex>
    </div>
  );
};

export default NewProduct;

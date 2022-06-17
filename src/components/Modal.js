import React from "react";
import Modal from "react-modal";
import {
  Heading,
  Button,
  IconClose,
  IconSave,
  Flex,
  View,
} from "@aws-amplify/ui-react";

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

const ModalComponent = ({
  isOpen,
  title,
  save,
  closeModal,
  afterOpenModal,
  buttons,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      onAfterOpen={afterOpenModal}
      style={customStyles}
    >
      <View width="20rem">
        <Heading level="4">{title}</Heading>
        <div style={{ margin: "15px 0 35px" }}>{children}</div>
        <Flex>
          {buttons ? (
            buttons
          ) : (
            <>
              <Button variation="primary" onClick={save}>
                <IconSave />
                Save
              </Button>
              <Button onClick={closeModal}>Cancel</Button>
            </>
          )}
        </Flex>
        <div style={{ position: "absolute", right: 10, top: 10 }}>
          <IconClose onClick={closeModal} />
        </div>
      </View>
    </Modal>
  );
};

export default ModalComponent;

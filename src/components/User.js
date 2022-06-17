import React, { useState, useContext } from "react";
import { Auth } from "aws-amplify";
import {
  Heading,
  Table,
  TableCell,
  TableBody,
  TableRow,
  Button,
  Badge,
  TextField,
  Text,
} from "@aws-amplify/ui-react";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import { UserContext } from "../providers/UserProvider";
import { useEffect } from "react";

const User = ({ user }) => {
  const { userAttributes } = useContext(UserContext);

  const [modalIsOpen, setIsOpen] = useState(false);
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const [verificationForm, setVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [email, setEmail] = useState(userAttributes.email);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const sendVerificationCode = async attr => {
    await Auth.verifyCurrentUserAttribute(attr);
    setIsOpen(true);
    setVerificationForm(true);
    toast.info(`Verification code sent to ${email}`);
  };

  const handleUpdateEmail = async () => {
    try {
      await Auth.updateUserAttributes(user, { email });
      console.log("result");
      sendVerificationCode("email");
    } catch (error) {
      console.error("error", error);
      toast.error(`${error.message || "Error updating email"}`);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await Auth.verifyCurrentUserAttributeSubmit("email", verificationCode);
      toast.success("Email successfully verified");
      closeModal();
    } catch (error) {
      console.error("error", error);
      toast.error(`${error.message || "Error updating email"}`);
    } finally {
      setIsOpen(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await user.deleteUser();
    } catch (error) {
      toast.error(`${error.message || "Error deleting profile"}`);
    }
  };

  useEffect(() => {
    if (!userAttributes.email_verified) {
      setVerificationForm(true);
    }
  }, [userAttributes]);

  const data = [
    {
      name: "Your Id",
      value: userAttributes.sub,
    },
    {
      name: "Username",
      value: user.username,
    },
    {
      name: "Email",
      value: userAttributes.email,
      verified: userAttributes.email_verified,
      editable: true,
    },
    {
      name: "Phone Number",
      value: userAttributes.phone_number,
    },
    {
      name: "Delete Profile",
      value: "Sorry to see you go",
      deletable: true,
    },
  ];

  return (
    <>
      <Heading level={3} className="heading-blue">
        Profile summary
      </Heading>
      <div style={{ maxWidth: "50%" }}>
        <Table
          variation="bordered"
          highlightOnHover
          title="User Info"
          backgroundColor="white"
        >
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <strong>{row.name}</strong>
                </TableCell>
                <TableCell>{row.value}</TableCell>
                <TableCell>
                  {row.name === "Email" && !row.verified && (
                    <Badge variation="error">Not Verified</Badge>
                  )}
                  {row.verified && <Badge variation="success">Verified</Badge>}
                </TableCell>
                <TableCell>
                  {row.editable ? (
                    <Button variation="primary" onClick={() => openModal()}>
                      Edit
                    </Button>
                  ) : row.deletable ? (
                    <Button
                      backgroundColor="tomato"
                      color="white"
                      onClick={() => {
                        setConfirmIsOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Modal
        title={verificationForm ? "Verify Your Email" : "Edit Email"}
        isOpen={modalIsOpen}
        closeModal={closeModal}
        save={verificationForm ? handleVerifyEmail : handleUpdateEmail}
      >
        <TextField
          label="Email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {verificationForm && (
          <TextField
            label="Enter Verification Code"
            placeholder="Verification code"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
          />
        )}
      </Modal>
      <Modal
        title="Attention!"
        buttons={
          <>
            <Button
              backgroundColor="tomato"
              color="white"
              onClick={handleDeleteProfile}
            >
              Yes, Delete
            </Button>
            <Button onClick={() => setConfirmIsOpen(false)}>Cancel</Button>
          </>
        }
        isOpen={confirmIsOpen}
        closeModal={() => setConfirmIsOpen(false)}
      >
        <Text>This will permanently delete your account. Continue?</Text>
      </Modal>
    </>
  );
};

export default User;

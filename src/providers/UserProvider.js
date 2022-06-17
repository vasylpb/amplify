import React, { createContext, useEffect, useState } from "react";
import { Auth } from "aws-amplify";

export const UserContext = createContext({});

const UserProvider = ({ user, children }) => {
  const [userAttributes, setAttributes] = useState({});

  useEffect(() => {
    getUserAttributes();
  }, []);

  const getUserAttributes = async () => {
    const result = await Auth.userAttributes(user);
    const attributes = Auth.attributesToObject(result);
    setAttributes(attributes);
  };

  return (
    <UserContext.Provider value={{ userAttributes }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

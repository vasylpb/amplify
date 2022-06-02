import React from "react";
import { NavLink, Link as ReactRouterLink } from "react-router-dom";
import { Icon } from "react-icons-kit";
import { Button, Heading, Flex, Link } from "@aws-amplify/ui-react";
import { home } from "react-icons-kit/icomoon/home";
import { user as userIcon } from "react-icons-kit/icomoon/user";

const Navbar = ({ user, signOut }) => {
  return (
    <div
      style={{
        borderBottom: "1px solid #ccc",
        marginBottom: "10px",
        padding: "10px 20px",
        backgroundColor: "#eee",
      }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <NavLink to="/" className="nav-link">
          <span className="app-title">
            <Icon size={64} icon={home} />
            <span>AmplifyAgora</span>
          </span>
        </NavLink>
        <Flex alignItems="center">
          <Heading level={6}>Hello {user}</Heading>
          <div className="nav-items">
            <Link as={ReactRouterLink} to="/profile">
              <Icon icon={userIcon} />
              Profile
            </Link>
          </div>
          <Button variation="primary" onClick={signOut}>
            Sign out
          </Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default Navbar;

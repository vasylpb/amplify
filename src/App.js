import "./App.css";
import {
  Authenticator,
  AmplifyProvider,
  // defaultTheme,
} from "@aws-amplify/ui-react";
import { ToastContainer } from "react-toastify";
import "@aws-amplify/ui-react/styles.css";
import { Auth, API, graphqlOperation } from "aws-amplify";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import { getUser } from "./graphql/queries";
import { registerUser } from "./graphql/mutations";
import UserProvider from "./providers/UserProvider";

const theme = {
  name: "pretty",
  tokens: {
    components: {
      button: {
        primary: {
          background: {
            color: { value: "var(--amplify-colors-orange-60)" },
          },
        },
      },
    },
  },
};

function App() {
  const registerNewUser = async user => {
    const { data } = await API.graphql(
      graphqlOperation(getUser, { id: user.username })
    );
    if (!data.getUser) {
      try {
        const registerUserInput = {
          id: user.username,
          email: user.attributes.email,
          username: user.attributes.email,
          registered: true,
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log("newUser", newUser);
      } catch (error) {
        console.error("Error registering new user", error);
      }
    }
  };

  const services = {
    async handleSignIn(formData) {
      let { username, password } = formData;
      return Auth.signIn({
        username,
        password,
      }).then(data => {
        registerNewUser(data);
        return data;
      });
    },
  };

  return (
    <AmplifyProvider theme={theme}>
      <Authenticator services={services}>
        {({ user, signOut }) => (
          <BrowserRouter>
            <UserProvider user={user}>
              <Navbar user={user.attributes.email} signOut={signOut} />
              <main className="app-container">
                <Switch>
                  <Route exact path="/" component={HomePage} />
                  <Route
                    path="/profile"
                    component={() => <ProfilePage user={user} />}
                  />
                  <Route path="/markets/:marketId" component={MarketPage} />
                </Switch>
              </main>
              <ToastContainer
                position="top-right"
                hideProgressBar
                closeOnClick
                autoClose={3000}
              />
            </UserProvider>
          </BrowserRouter>
        )}
      </Authenticator>
    </AmplifyProvider>
  );
}

export default App;

import "./App.css";
import {
  Authenticator,
  AmplifyProvider,
  // defaultTheme,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";

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
  // console.log("defaultTheme", defaultTheme);
  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({ user, signOut }) => (
          <BrowserRouter>
            <Navbar user={user.attributes.email} signOut={signOut} />
            <main className="app-container">
              <Switch>
                <Route exact path="/" component={HomePage} />
                <Route path="/profile" component={ProfilePage} />
                <Route path="/markets/:marketId" component={MarketPage} />
              </Switch>
            </main>
          </BrowserRouter>
        )}
      </Authenticator>
    </AmplifyProvider>
  );
}

export default App;

import React from "react";
import Header from "./components/Header";
import { Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import BusinessNews from "./components/newsPages/businessNews";
import PoliticsNews from "./components/newsPages/politicsNews";
import ScienceNews from "./components/newsPages/scienceNews";
import SportsNews from "./components/newsPages/sportsNews";
import SearchNews from "./components/newsPages/searchNews";
import Footer from "./components/Footer";

function App() {
  //Footer scroll doesn't want to listen on this page
  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/business" component={BusinessNews} />
        <Route exact path="/politics" component={PoliticsNews} />
        <Route exact path="/science" component={ScienceNews} />
        <Route exact path="/sports" component={SportsNews} />
        <Route exact path="/search" component={SearchNews} />
      </Switch>
    </div>
  );
}

export default App;

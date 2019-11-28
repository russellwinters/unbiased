import React, { useState } from "react";
import Header from "./components/Header";
import { Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import BusinessNews from "./components/newsPages/businessNews";
import PoliticsNews from "./components/newsPages/politicsNews";
import ScienceNews from "./components/newsPages/scienceNews";
import SportsNews from "./components/newsPages/sportsNews";

function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  return (
    <div className="App">
      <Header state={currentPage} setState={setCurrentPage} />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/business" component={BusinessNews} />
        <Route exact path="/politics" component={PoliticsNews} />
        <Route exact path="/science" component={ScienceNews} />
        <Route exact path="/sports" component={SportsNews} />
      </Switch>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import Header from "./components/Header";
import { Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import BusinessNews from "./components/newsPages/businessNews";
import PoliticsNews from "./components/newsPages/politicsNews";
import ScienceNews from "./components/newsPages/scienceNews";
import SportsNews from "./components/newsPages/sportsNews";
import axios from "axios";

function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  return (
    <div className="App">
      <Header state={currentPage} setState={setCurrentPage} />
      {/* <header className="App-header">Hello World</header> */}
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/business" component={BusinessNews} />
        <Route exact path="/politics" component={PoliticsNews} />
        <Route exact path="/science" component={ScienceNews} />
        <Route exact path="/sports" component={SportsNews} />
      </Switch>
      <h1>{currentPage}</h1>
    </div>
  );
}

export default App;

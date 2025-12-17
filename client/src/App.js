import React from "react";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import BusinessNews from "./components/newsPages/businessNews";
import PoliticsNews from "./components/newsPages/politicsNews";
import ScienceNews from "./components/newsPages/scienceNews";
import SportsNews from "./components/newsPages/sportsNews";
import SearchNews from "./components/newsPages/searchNews";
import ProfilePage from "./components/profilePages/ProfilePage";

function App() {
  //Footer scroll doesn't want to listen on this page
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/business" element={<BusinessNews />} />
        <Route path="/politics" element={<PoliticsNews />} />
        <Route path="/science" element={<ScienceNews />} />
        <Route path="/sports" element={<SportsNews />} />
        <Route path="/search" element={<SearchNews />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;

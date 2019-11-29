import React from "react";
import CreateArticles from "./CreateArticles";

export default function MapArticles(props) {
  const { articles } = props;
  console.log(props);
  const createSection = articles.map(obj => {
    return <CreateArticles obj={obj} />;
  });

  return <>{createSection}</>;
}

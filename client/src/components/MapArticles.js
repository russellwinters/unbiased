import React from "react";
import CreateArticles from "./CreateArticles";

export default function MapArticles(props) {
  const { articles } = props;
  const createSection = articles.map(obj => {
    return <CreateArticles key={`${obj.title}${obj.description}`} obj={obj} />;
  });

  return <>{createSection}</>;
}

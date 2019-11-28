import React from "react";

export default function MapArticles(props) {
  const articles = props.articles;
  const mapFunction = articles.map(obj => {
    return (
      <>
        <p>{obj.title}</p>
        {/* <p>{obj.description}</p>
        <p>{obj.source.id}</p> */}
      </>
    );
  });
  return <>{mapFunction}</>;
}

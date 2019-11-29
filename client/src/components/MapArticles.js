import React from "react";

export default function MapArticles(props) {
  const articles = props.articles;
  console.log(props);
  const mapFunction = articles.map(obj => {
    return (
      <div>
        <p>{obj.title}</p>
        {/* <p>{obj.description}</p> */}
      </div>
    );
  });
  return <>{mapFunction}</>;
}

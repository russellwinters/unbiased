import React, { useState } from "react";

export default function CreateArticles(props) {
  const [clicked, setClicked] = useState(false);
  const { obj } = props;
  let bias = "";
  if (
    obj.source.id === "politico" ||
    obj.source.id === "the-washington-post" ||
    obj.source.id === "the-new-york-times"
  ) {
    bias = "left-leaning";
  } else if (
    obj.source.id === "abc-news" ||
    obj.source.id === "reuters" ||
    obj.source.id === "usa-today"
  ) {
    bias = "minimal-bias";
  } else if (
    obj.source.id === "fox-news" ||
    obj.source.id === "the-wall-street-journal" ||
    obj.source.id === "national-review" ||
    obj.source.id === "the-hill"
  ) {
    bias = "right-leaning";
  } else {
    bias = "minimal";
  }

  if (clicked === false) {
    return (
      <div className="article">
        <h3 className="article-title">{obj.title}</h3>
        <h1>{bias}</h1>
        <button onClick={() => setClicked(true)}>Expand</button>
      </div>
    );
  } else
    return (
      <div className="article">
        <h3 className="article-title">{obj.title}</h3>
        <p className="article-description">{obj.description}</p>
        <span className="article-source">{obj.source.name}</span>
        <a
          className="article-link"
          href={obj.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Full Article
        </a>
        <h1>{bias}</h1>
        <button onClick={() => setClicked(false)}>Retract</button>
      </div>
    );
}

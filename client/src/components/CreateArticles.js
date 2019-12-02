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
    bias = "minimal";
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
      <div
        className={`article article-${bias}`}
        onClick={() => setClicked(true)}
      >
        <h3 className="article-title">{obj.title}</h3>
        <img className="article-image" src={obj.imageURL} />
      </div>
    );
  } else
    return (
      <div
        className={`open-article article-${bias}`}
        onClick={() => setClicked(false)}
      >
        <h3 className="open-article-title">{obj.title}</h3>
        <p className="open-article-description">{obj.description}</p>
        <img className="open-article-image" src={obj.imageURL} />
        <span className={`open-article-source article-source__${bias}`}>
          {obj.source.name}
        </span>

        <a
          className={`open-article-link article-link__${bias}`}
          href={obj.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Full Article Here
        </a>
      </div>
    );
}

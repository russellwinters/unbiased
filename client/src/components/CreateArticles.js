import React, { useState } from "react";

export default function CreateArticles(props) {
  const [clicked, setClicked] = useState(false);
  const { obj } = props;

  let politicalBias = "";
  if (obj.bias) {
    politicalBias = `${obj.bias}`;
  }

  if (clicked === false) {
    return (
      <div
        className={`article article-${politicalBias}`}
        onClick={() => setClicked(true)}
      >
        <h3 className="article-title">{obj.title}</h3>
        <img
          className={`article-image article-image__${obj.imageType}`}
          src={obj.imageURL}
          alt="Photograph From Source"
        />
      </div>
    );
  } else
    return (
      <div
        className={`open-article article-${politicalBias}`}
        onClick={() => setClicked(false)}
      >
        <h3 className="open-article-title">{obj.title}</h3>
        <p className="open-article-description">{obj.description}</p>
        <img
          className="open-article-image"
          src={obj.imageURL}
          alt="Photograph From Source"
        />
        <span
          className={`open-article-source article-source__${politicalBias}`}
        >
          {obj.source.name}
        </span>

        <a
          className={`open-article-link article-link__${politicalBias}`}
          href={obj.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Full Article Here
        </a>
      </div>
    );
}

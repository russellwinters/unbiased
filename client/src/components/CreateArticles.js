import React, { useState } from "react";

export default function CreateArticles(props) {
  const [clicked, setClicked] = useState(false);
  const { obj } = props;
  //Make this a switch instead of if else
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
        <h3>{obj.imageType}</h3>
        <img className="article-image" src={obj.imageURL} />
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
        <img className="open-article-image" src={obj.imageURL} />
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

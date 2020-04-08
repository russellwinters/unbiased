import React, { useState } from "react";
import axios from "axios";

export default function CreateArticles(props) {
  const [clicked, setClicked] = useState(false);
  const { obj } = props;

  //Determine source Bias if there is any
  let politicalBias = "";
  if (obj.bias) {
    politicalBias = `${obj.bias}`;
  }

  //onCLick function to handle bookmark
  const referenceID = () => {
    if (localStorage.getItem("token")) {
      let TOKEN = localStorage.getItem("token");
      let ARTICLE_ID = obj._id;

      //Sending post with user token and ID of Article
      let postObj = {
        TOKEN,
        ARTICLE_ID,
      };

      axios({
        method: "post",
        url: "http://localhost:5000/api/bookmark/add",
        data: postObj,
      }).then((res) => {
        console.log(res.data);
      });
    } else alert("You must have an account to bookmark an article");
  };

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

        <button onClick={referenceID}>Bookmark</button>
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

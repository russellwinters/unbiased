import React, { useState } from "react";

export default function CreateArticles(props) {
  const [clicked, setClicked] = useState(false);
  const { obj } = props;

  if (clicked === false) {
    return (
      <div>
        <h3>{props.obj.title}</h3>
        <button onClick={() => setClicked(true)}>Expand</button>
      </div>
    );
  } else
    return (
      <div>
        <h3>{props.obj.title}</h3>
        <p>{props.obj.description}</p>
        <button onClick={() => setClicked(false)}>Retract</button>
      </div>
    );
}

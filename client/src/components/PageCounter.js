import React from "react";

export default function PageCounter(props) {
  return (
    <div>
      <button
        onClick={() => {
          props.setPage(0);
        }}
      >
        1
      </button>
      <button
        onClick={() => {
          props.setPage(1);
        }}
      >
        2
      </button>
      <button
        onClick={() => {
          props.setPage(2);
        }}
      >
        3
      </button>
      <button
        onClick={() => {
          props.setPage(3);
        }}
      >
        4
      </button>
      <button
        onClick={() => {
          props.setPage(4);
        }}
      >
        5
      </button>
      <button
        onClick={() => {
          props.setPage(5);
        }}
      >
        6
      </button>
    </div>
  );
}

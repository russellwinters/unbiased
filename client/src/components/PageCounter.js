import React from "react";

export default function PageCounter(props) {
  const { setPage } = props;
  return (
    <div>
      <button
        onClick={() => {
          setPage(0);
        }}
      >
        1
      </button>
      <button
        onClick={() => {
          setPage(1);
        }}
      >
        2
      </button>
      <button
        onClick={() => {
          setPage(2);
        }}
      >
        3
      </button>
      <button
        onClick={() => {
          setPage(3);
        }}
      >
        4
      </button>
      <button
        onClick={() => {
          setPage(4);
        }}
      >
        5
      </button>
      <button
        onClick={() => {
          setPage(5);
        }}
      >
        6
      </button>
    </div>
  );
}

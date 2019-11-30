import React from "react";

export default function PageCounter(props) {
  const { setPage } = props;
  return (
    <div className="counter">
      <button
        className="counter-button"
        onClick={() => {
          setPage(0);
          window.scrollTo(0, 0);
        }}
      >
        1
      </button>
      <button
        className="counter-button"
        onClick={() => {
          setPage(1);
          window.scrollTo(0, 0);
        }}
      >
        2
      </button>
      <button
        className="counter-button"
        onClick={() => {
          setPage(2);
          window.scrollTo(0, 0);
        }}
      >
        3
      </button>
      <button
        className="counter-button"
        onClick={() => {
          setPage(3);
          window.scrollTo(0, 0);
        }}
      >
        4
      </button>
      <button
        className="counter-button"
        onClick={() => {
          setPage(4);
          window.scrollTo(0, 0);
        }}
      >
        5
      </button>
      <button
        className="counter-button"
        onClick={() => {
          setPage(5);
          window.scrollTo(0, 0);
        }}
      >
        6
      </button>
    </div>
  );
}

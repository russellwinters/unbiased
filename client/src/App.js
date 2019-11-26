import React from "react";
import axios from "axios";

function App() {
  let arr1 = [1, 2, 3, 4, 5, 6];
  let arr2 = [1, 3, 5, 7, 9, 11, 13];
  let arr3 = [...arr1, ...arr2];
  console.log(new Set(arr3));
  console.log(arr3);
  // const filterArr = (arr, arrtwo) => {
  //   let returnArray = [];
  //   arrtwo.map(obj => {
  //     if(arr.indexOf(obj) === -1) {
  //       returnArray.push(obj)
  //     }
  //   })
  // }
  return (
    <div className="App">
      <header className="App-header">Hello World</header>
    </div>
  );
}

export default App;

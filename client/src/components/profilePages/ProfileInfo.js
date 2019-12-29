import React from 'react'
const jwt = require('jsonwebtoken');


export default function ProfileInfo() {
    const token = localStorage.getItem("token");
    var decodedUser;
    jwt.verify(token, "unbiasedkeys", (err, decoded) => {
        decodedUser = decoded;
    })



    return (
        <div>
<h2>{`${decodedUser.username}`}</h2>
<p>{`Logged on at ${decodedUser.iat}`}</p>
        </div>
    )
}

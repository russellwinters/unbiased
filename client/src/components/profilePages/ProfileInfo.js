import React from 'react'
import jwtDecode from 'jwt-decode'

export default function ProfileInfo() {
    const token = localStorage.getItem("token");
    let decodedUser = null;
    try {
        if (token) decodedUser = jwtDecode(token);
    } catch (e) {
        decodedUser = null;
    }

    if (!decodedUser) return <div>No user information available</div>

    return (
        <div>
            <h2>{decodedUser.username}</h2>
            <p>{`Logged on at ${decodedUser.iat}`}</p>
        </div>
    )
}

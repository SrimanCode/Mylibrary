import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';

// function Likes() {
//     const [likeCount, setLikeCount] = useState(0);
    
//     const incrementLike = () => {
//         setLikeCount(prevCount => prevCount + 1);
//     }

//     return (
//         <div>
//             <h1>Likes: {likeCount}</h1>
//             <button onClick={incrementLike}>Like</button>
//         </div>
//     );
// }

function Likes() {
    const [likes, setLikes] = useState(0);

    const incrementLike = () => {
        setLikes(prevCount => prevCount + 1);
    }
    return (
        <>
        <div className="d-flex justify-content-end">
            <h1>Likes: {likes} </h1>
            <button onClick={incrementLike} variant="outline-success">Like</button>
        </div>
        </>
    );
}
export default Likes;

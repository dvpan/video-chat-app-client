import React from 'react';


const UserComponent = ({ isItMe, username }) => {
    return (
        <div>
            {username}
            {
                isItMe 
                &&
                <i> (You)</i>
            }
        </div>
    )
}

export default UserComponent;
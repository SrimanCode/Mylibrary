import React, { useState, useEffect } from 'react';

function UsersTable() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/userinfo')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => setUsers(data))
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                setError('Failed to fetch data');
            });
    }
    , []);

    return (
        <div>
            {error ? <p>{error}</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsersTable;

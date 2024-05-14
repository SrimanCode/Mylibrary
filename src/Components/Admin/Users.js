import React, { useState, useEffect } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/userinfo");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">User List</h1>
      <ul className="p-4 bg-white rounded-lg shadow-md">
        {users.map((user) => (
          <li key={user.id} className="p-2 border-b last:border-b-0">
            <p className="font-semibold text-gray-900">{user.username}</p>
            <p className="text-gray-600">{user.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link';
import { useSession } from "next-auth/react"; // Import the hook
import { updateRestaurant } from '../api/restaurants/updateRestaurant';
import { deleteRestaurant } from '../api/restaurants/deleteRestaurant';
import { getUsers } from '../api/users/getUsers';

type Restaurant = {
    id: number;
    name: string
    address: string
    phone: string
    generalDescription: string
    ownerId: number
}

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userRoles: string;
}

export default function RestaurantsTableRowComponent({id, name, address, phone, generalDescription, ownerId}: Restaurant) {
  const [formData, setFormData] = useState<Restaurant>({ id, name, address, phone, generalDescription, ownerId });
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession(); // Access the session on the client

  useEffect(() => {
    const fetchUsers = async () => {
      const token = session?.backendAccessToken;
      if (!token) return;
      try {
        const usersData = await getUsers(token);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, [session]);

const handleChange = (field: keyof Restaurant, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: field === 'ownerId' ? Number(value) : value }));
  };

const handleSave = async () => {
    const token = session?.backendAccessToken;
    console.log("Attempting to save restaurant with token:", token);
    if (!token) {
      alert("You must be logged in to perform this action");
      return;
    }

    try {
      await updateRestaurant(formData, token); // Send the state to your API
      alert("Restaurant updated successfully!");
    } catch (error) {
      console.error("Failed to update restaurant", error);
    }
  };

const handleDelete = async () => {
    const token = session?.backendAccessToken;
    console.log("Attempting to delete restaurant with token:", token);
    if (!token) {
      alert("You must be logged in to perform this action");
      return;
    }

    try {
      await deleteRestaurant(formData, token); // Send the state to your API
      alert("Restaurant deleted successfully!");
    } catch (error) {
      console.error("Failed to delete restaurant", error);
    }
  };

  return (
      <tr>
        <th></th>
        <th>{id}</th>
        <td><input className="input input-xs input-ghost text-center align-middle" 
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)} /></td>
        <td><input className="input input-xs input-ghost text-center align-middle" 
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)} /></td>
        <td><input className="input input-xs input-ghost text-center align-middle" 
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)} /></td>
         <td><textarea className="textarea textarea-xs textarea-ghost text-center align-middle" 
          value={formData.generalDescription}
          onChange={(e) => handleChange("generalDescription", e.target.value)}></textarea></td>
        <td><select className="select select-xs select-ghost text-center align-middle" 
          value={formData.ownerId}
          onChange={(e) => handleChange("ownerId", e.target.value)}>
          {users.map(user => <option key={user.id} value={user.id}>{user.id} - {user.firstName} {user.lastName}</option>)}
        </select></td>
        <td>
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn btn-active btn-info btn-sm sm:btn-md">
              <Link href={`/admindashboard/restaurants/${id}`}>Edit</Link>
            </button>
            <button className="btn btn-active btn-success btn-sm sm:btn-md" 
              onClick={async () => await handleSave()}>Save</button>
            <button className="btn btn-active btn-error btn-sm sm:btn-md" onClick={async () => await handleDelete()}>Delete</button>
          </div>
        </td>
      </tr>
  );
}

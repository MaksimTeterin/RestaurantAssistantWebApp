'use client'
import { useState } from 'react'
import { updateUser } from "../api/users/updateUser";
import { useSession } from "next-auth/react"; // Import the hook
import { deleteUser } from '../api/users/deleteUser';

type User = {
    id: number;
    firstName: string
    lastName: string
    email: string
    userRoles: string
}

export default function UsersTableRowComponent({id, firstName, lastName, email, userRoles}: User) {
  const [formData, setFormData] = useState<User>({ id, firstName, lastName, email, userRoles });
  const { data: session } = useSession(); // Access the session on the client
const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSave = async () => {
    const token = session?.backendAccessToken;
    console.log("Attempting to save user with token:", token);
    if (!token) {
      alert("You must be logged in to perform this action");
      return;
    }

    try {
      await updateUser(formData, token); // Send the state to your API
      alert("User updated successfully!");
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

const handleDelete = async () => {
    const token = session?.backendAccessToken;
    console.log("Attempting to delete user with token:", token);
    if (!token) {
      alert("You must be logged in to perform this action");
      return;
    }

    try {
      await deleteUser(formData, token); // Send the state to your API
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  return (
      <tr>
        <th></th>
        <th className="text-center">{id}</th>
        <td className="text-center">{formData.firstName}</td>
        <td className="text-center">{formData.lastName}</td>
        <td className="text-center">{formData.email}</td>
         <td><select className="select select-xs select-ghost text-center align-middle" 
          value={formData.userRoles}
          onChange={(e) => handleChange("userRoles", e.target.value)}>
          <option value="ROLE_USER">ROLE_USER</option>
          <option value="ROLE_SYSTEM_ADMIN">ROLE_SYSTEM_ADMIN</option>
          <option value="ROLE_RESTAURANT_ADMIN">ROLE_RESTAURANT_ADMIN</option>
         </select></td>
        <td>
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn btn-active btn-success btn-sm sm:btn-md" 
              onClick={async () => await handleSave()}>Save</button>
            <button className="btn btn-active btn-error btn-sm sm:btn-md" onClick={async () => await handleDelete()}>Delete</button>
          </div>
        </td>
      </tr>
  );
}

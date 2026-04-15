'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { updateRestaurant } from '../api/restaurants/updateRestaurant';
import { deleteRestaurant } from '../api/restaurants/deleteRestaurant';

type Restaurant = {
  id: number;
  name: string;
  address: string;
  phone: string;
  generalDescription: string;
  ownerId: number;
};

export default function OwnerRestaurantsTableRowComponent({ id, name, address, phone, generalDescription, ownerId }: Restaurant) {
  const [formData, setFormData] = useState<Restaurant>({ id, name, address, phone, generalDescription, ownerId });
  const { data: session } = useSession();

  const handleChange = (field: keyof Restaurant, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const token = session?.backendAccessToken;
    if (!token) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      await updateRestaurant(formData, token);
      alert('Restaurant updated successfully!');
    } catch (error) {
      console.error('Failed to update restaurant', error);
    }
  };

  const handleDelete = async () => {
    const token = session?.backendAccessToken;
    if (!token) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      await deleteRestaurant(formData, token);
      alert('Restaurant deleted successfully!');
    } catch (error) {
      console.error('Failed to delete restaurant', error);
    }
  };

  return (
    <tr>
      <th></th>
      <th className="text-center">{id}</th>
      <td>
        <input
          className="input input-xs input-ghost text-center align-middle"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </td>
      <td>
        <input
          className="input input-xs input-ghost text-center align-middle"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </td>
      <td>
        <input
          className="input input-xs input-ghost text-center align-middle"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </td>
      <td>
        <textarea
          className="textarea textarea-xs textarea-ghost text-center align-middle"
          value={formData.generalDescription}
          onChange={(e) => handleChange('generalDescription', e.target.value)}
        />
      </td>
      <td>
        <div className="flex flex-wrap justify-center gap-2">
          <button className="btn btn-active btn-info btn-sm sm:btn-md">
            <Link href={`/ownerdashboard/restaurants/${id}`}>Manage</Link>
          </button>
          <button className="btn btn-active btn-success btn-sm sm:btn-md" onClick={async () => await handleSave()}>
            Save
          </button>
          <button className="btn btn-active btn-error btn-sm sm:btn-md" onClick={async () => await handleDelete()}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

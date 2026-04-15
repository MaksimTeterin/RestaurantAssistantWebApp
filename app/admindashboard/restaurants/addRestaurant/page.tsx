'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUsers } from "../../../api/users/getUsers";
import { addRestaurant } from "../../../api/restaurants/addRestaurant";
import { addBusinessDay } from "../../../api/businessDay/addBusinessDay";

// business day model mirrors backend

type BusinessDay = {
    dayOfWeek: string;
    isOperating: boolean;
    openTime: string;
    closeTime: string;
};

type Restaurant = {
    id: number;
    name: string;
    address: string;
    phone: string;
    generalDescription: string;
    ownerId: number;
};

const initialDays: BusinessDay[] = [
    { dayOfWeek: 'MONDAY', isOperating: false, openTime: '', closeTime: '' },
    { dayOfWeek: 'TUESDAY', isOperating: false, openTime: '', closeTime: '' },
    { dayOfWeek: 'WEDNESDAY', isOperating: false, openTime: '', closeTime: '' },
    { dayOfWeek: 'THURSDAY', isOperating: false, openTime: '', closeTime: '' },
    { dayOfWeek: 'FRIDAY', isOperating: false, openTime: '', closeTime: '' },
    { dayOfWeek: 'SATURDAY', isOperating: false, openTime: '', closeTime: '' },
    { dayOfWeek: 'SUNDAY', isOperating: false, openTime: '', closeTime: '' },
];



export default function AddRestaurantPage() {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        description: '',
        ownerId: '', // will store selected user id as string
        businessDays: initialDays,
    });

    const [users, setUsers] = useState<{id:number, firstName:string, lastName:string}[]>([]);
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDayChange = (index: number, field: keyof BusinessDay, value: string | boolean) => {
        setFormData((prev) => {
            const days = [...prev.businessDays];
            // @ts-ignore
            days[index][field] = value;
            return { ...prev, businessDays: days };
        });
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const token = session?.backendAccessToken;
            if (!token) return;
            try {
                const list = await getUsers(token);
                setUsers(list || []);
            } catch (e) {
                console.error("Could not load users", e);
            }
        };
        fetchUsers();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const token = session?.backendAccessToken;
        if (!token) {
            setError('You must be logged in to perform this action');
            setIsLoading(false);
            return;
        }

        try {
            // Prepare restaurant data without businessDays
            const restaurantData: Omit<Restaurant, 'id'> = {
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                generalDescription: formData.description,
                ownerId: Number(formData.ownerId),
            };

            // Add restaurant
            const restaurantResponse = await addRestaurant(restaurantData, token);
            console.log("Restaurant data:", restaurantData);
            if (!restaurantResponse || !restaurantResponse.id) {
                throw new Error('Failed to add restaurant');
            }

            // Add business days one by one
            for (const day of formData.businessDays) {
                if (day.isOperating) {
                    await addBusinessDay({
                        dayOfWeek: day.dayOfWeek,
                        openTime: `${day.openTime}:00`,
                        closeTime: `${day.closeTime}:00`,
                        restaurantId: restaurantResponse.id,
                    }, token);
                }
            }

            alert('Restaurant added successfully!');
            // Optionally reset form or redirect
        } catch (err) {
            console.error(err);
            setError('Failed to add restaurant. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-12">
            <div className="mx-auto w-full max-w-4xl">
                <div className="bg-white shadow-lg rounded-lg p-4 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">Add New Restaurant</h1>

                    {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">{error}</div>}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Restaurant Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Name"
                    />
                </div>


                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Address"
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Phone"
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Owner</label>
                    <select
                        name="ownerId"
                        value={formData.ownerId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Owner</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description <span className="text-xs text-gray-500">(used by AI, make it as informative as possible)</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Description"
                    />
                </div>

                                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-1">Business Hours</h3>
                                        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      {formData.businessDays.map((day, idx) => (
                                                <div key={day.dayOfWeek} className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <input
                              type="checkbox"
                              checked={day.isOperating}
                              onChange={(e) => handleDayChange(idx, 'isOperating', e.target.checked)}
                            />
                                                        <span className="ml-1 w-14 sm:w-20">{day.dayOfWeek.slice(0,3)}</span>
                            {day.isOperating && (
                              <>
                                <input
                                    type="time"
                                    value={day.openTime}
                                    onChange={(e) => handleDayChange(idx, 'openTime', e.target.value)}
                                                                        className="border rounded px-1 py-0.5 w-full sm:w-24"
                                />
                                <span className="mx-1">to</span>
                                <input
                                    type="time"
                                    value={day.closeTime}
                                    onChange={(e) => handleDayChange(idx, 'closeTime', e.target.value)}
                                                                        className="border rounded px-1 py-0.5 w-full sm:w-24"
                                />
                              </>
                            )}
                        </div>
                      ))}
                    </div>
                </div>

                                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 text-sm"
                    >
                        {isLoading ? 'Adding...' : 'Add Restaurant'}
                    </button>
                </div>
            </form>
                </div>
            </div>
        </div>
    );
}
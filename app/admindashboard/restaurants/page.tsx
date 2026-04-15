import Link from "next/link";
import { getSession } from "next-auth/react";
import RestaurantsTableRowComponent from "../../Components/RestaurantsTableRowComponent";
import UsersTableRowComponent from "../../Components/UsersTableRowComponent";
import { getRestaurants } from "../../api/restaurants/getRestaurants";
import { getUsers } from "../../api/users/getUsers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userRoles: string;
};

type Restaurant = {
    id: number;
    name: string
    address: string
    phone: string
    generalDescription: string
    ownerId: number
}

export default async function admindashboard() {

  const session = await getServerSession(authOptions);
    console.log("Session data:", session?.role);
      if (!session?.role || (session.role != "ROLE_RESTAURANT_ADMIN" && session.role != "ROLE_SYSTEM_ADMIN")) {
    return <div>No permission to view this page.</div>;
  }


  const restaurantData = await getRestaurants();


  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold">Restaurant Management</h2>
        <Link href="/admindashboard/restaurants/addRestaurant">
          <button className="btn btn-primary w-full sm:w-auto">Add Restaurant</button>
        </Link>
      </div>
      <div className="overflow-x-auto shadow-md rounded-lg bg-base-100 p-4">
        <p className="text-sm text-gray-600 mb-2">Total restaurants: {restaurantData.length}</p>
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th className="text-center">Id</th>
              <th className="text-center">Name</th>
              <th className="text-center">Address</th>
              <th className="text-center">Phone</th>
              <th className="text-center">General Description</th>
              <th className="text-center">Owner Id</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {restaurantData.map((restaurant: Restaurant) => (
              <RestaurantsTableRowComponent
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                address={restaurant.address}
                phone={restaurant.phone}
                generalDescription={restaurant.generalDescription}
                ownerId={restaurant.ownerId}
              ></RestaurantsTableRowComponent>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th className="text-center">Id</th>
              <th className="text-center">Name</th>
              <th className="text-center">Address</th>
              <th className="text-center">Phone</th>
              <th className="text-center">General Description</th>
              <th className="text-center">Owner Id</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRestaurants } from "@/app/api/restaurants/getRestaurants";
import { getCurrentOwnerId, isRestaurantOwnerRole } from "../ownerUtils";
import OwnerRestaurantsTableRowComponent from "@/app/Components/OwnerRestaurantsTableRowComponent";

type Restaurant = {
  id: number;
  name: string;
  address: string;
  phone: string;
  generalDescription: string;
  ownerId: number;
};

export default async function OwnerRestaurantsManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.role || !isRestaurantOwnerRole(session.role)) {
    return <div>No permission to view this page.</div>;
  }

  const ownerId = await getCurrentOwnerId(session);

  if (!ownerId) {
    return <div>Unable to identify current owner.</div>;
  }

  const allRestaurants = ((await getRestaurants()) ?? []) as Restaurant[];
  const ownerRestaurants = allRestaurants.filter((restaurant) => restaurant.ownerId === ownerId);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">My Restaurants Management</h2>
      <div className="overflow-x-auto shadow-md rounded-lg bg-base-100 p-4">
        <p className="text-sm text-gray-600 mb-2">Total restaurants: {ownerRestaurants.length}</p>
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th className="text-center">Id</th>
              <th className="text-center">Name</th>
              <th className="text-center">Address</th>
              <th className="text-center">Phone</th>
              <th className="text-center">General Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ownerRestaurants.map((restaurant) => (
              <OwnerRestaurantsTableRowComponent
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                address={restaurant.address}
                phone={restaurant.phone}
                generalDescription={restaurant.generalDescription}
                ownerId={restaurant.ownerId}
              />
            ))}
            {ownerRestaurants.length === 0 ? (
              <tr>
                <th></th>
                <td className="text-center" colSpan={6}>No restaurants found.</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th className="text-center">Id</th>
              <th className="text-center">Name</th>
              <th className="text-center">Address</th>
              <th className="text-center">Phone</th>
              <th className="text-center">General Description</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

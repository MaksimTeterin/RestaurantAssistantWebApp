import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRestaurants } from "@/app/api/restaurants/getRestaurants";
import { getCurrentOwnerId, isRestaurantOwnerRole } from "../ownerUtils";

type Restaurant = {
  id: number;
  name: string;
  ownerId: number;
};

export default async function OwnerBookingsOverviewPage() {
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">My Restaurants - Booking Management</h2>
      <div className="overflow-x-auto shadow-md rounded-lg bg-base-100 p-4">
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th className="text-center">Restaurant Id</th>
              <th className="text-center">Restaurant Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ownerRestaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <th></th>
                <td className="text-center">{restaurant.id}</td>
                <td className="text-center">{restaurant.name}</td>
                <td className="text-center">
                  <Link href={`/ownerdashboard/bookings/${restaurant.id}`}>
                    <button className="btn btn-active btn-info btn-sm sm:btn-md">View bookings</button>
                  </Link>
                </td>
              </tr>
            ))}
            {ownerRestaurants.length === 0 ? (
              <tr>
                <th></th>
                <td className="text-center" colSpan={3}>No restaurants found.</td>
                <td></td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th className="text-center">Restaurant Id</th>
              <th className="text-center">Restaurant Name</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

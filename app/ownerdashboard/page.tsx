import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRestaurants } from "@/app/api/restaurants/getRestaurants";
import { getBookingByRestaurantId } from "@/app/api/bookings/getBookings";
import { getCurrentOwnerId, isRestaurantOwnerRole } from "./ownerUtils";

type Restaurant = {
  id: number;
  name: string;
  ownerId: number;
};

export default async function OwnerDashboardPage() {
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

  const bookingDataByRestaurant = await Promise.all(
    ownerRestaurants.map((restaurant) => getBookingByRestaurantId(restaurant.id))
  );
  const bookingCount = bookingDataByRestaurant.reduce((sum, bookings) => sum + (bookings?.length ?? 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 sm:mb-10">Owner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        <div className="card bg-base-200 shadow-lg p-4 sm:p-6 text-center">
          <div className="card-body items-center">
            <h2 className="card-title">My Restaurants</h2>
            <p className="text-sm text-gray-600">Total: {ownerRestaurants.length}</p>
            <Link href="/ownerdashboard/restaurants" className="btn btn-primary mt-4">Manage restaurants</Link>
          </div>
        </div>
        <div className="card bg-base-200 shadow-lg p-4 sm:p-6 text-center">
          <div className="card-body items-center">
            <h2 className="card-title">My Bookings</h2>
            <p className="text-sm text-gray-600">Total: {bookingCount}</p>
            <Link href="/ownerdashboard/bookings" className="btn btn-primary mt-4">Manage bookings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

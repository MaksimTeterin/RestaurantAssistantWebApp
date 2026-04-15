import Link from "next/link";
import { getRestaurants } from "../api/restaurants/getRestaurants";
import { getUsers } from "../api/users/getUsers";
import { getBookingByRestaurantId } from "../api/bookings/getBookings";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

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


  const userData = await getUsers();
  console.log(userData);
  const session = await getServerSession(authOptions);
  console.log("Session data:", session?.role);
    if (!session?.role || (session.role != "ROLE_RESTAURANT_ADMIN" && session.role != "ROLE_SYSTEM_ADMIN")) {
  return <div>No permission to view this page.</div>;
}

  const restaurantData = await getRestaurants();
  const bookingDataByRestaurant = await Promise.all(
    restaurantData.map((restaurant: Restaurant) => getBookingByRestaurantId(restaurant.id)),
  );
  const bookingCount = bookingDataByRestaurant.reduce((sum, bookings) => sum + (bookings?.length ?? 0), 0);
  console.log(restaurantData);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 sm:mb-10">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        <Link href="/admindashboard/restaurants">
          <div className="card bg-base-200 shadow-lg hover:shadow-xl transition p-4 sm:p-6 text-center">
            <div className="card-body items-center">
              <h2 className="card-title">Restaurants</h2>
              <p className="text-sm text-gray-600">Total: {restaurantData.length}</p>
              <button className="btn btn-primary mt-4">Manage</button>
            </div>
          </div>
        </Link>
        <Link href="/admindashboard/users">
          <div className="card bg-base-200 shadow-lg hover:shadow-xl transition p-4 sm:p-6 text-center">
            <div className="card-body items-center">
              <h2 className="card-title">Users</h2>
              <p className="text-sm text-gray-600">Total: {userData.length}</p>
              <button className="btn btn-primary mt-4">Manage</button>
            </div>
          </div>
        </Link>
        <Link href="/admindashboard/bookings">
          <div className="card bg-base-200 shadow-lg hover:shadow-xl transition p-4 sm:p-6 text-center">
            <div className="card-body items-center">
              <h2 className="card-title">Bookings</h2>
              <p className="text-sm text-gray-600">Total: {bookingCount}</p>
              <button className="btn btn-primary mt-4">Manage</button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

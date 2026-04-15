import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getBookingByRestaurantId } from "@/app/api/bookings/getBookings";
import { normalizeBooking, type BookingRecord } from "@/app/admindashboard/bookings/bookingUtils";
import BookingTableRowComponent from "@/app/Components/BookingTableRowComponent";
import { getUserEmailById } from "@/app/api/users/getUserEmailById";
import { getRestaurants } from "@/app/api/restaurants/getRestaurants";
import { getCurrentOwnerId, isRestaurantOwnerRole } from "../../ownerUtils";

type BookingDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Restaurant = {
  id: number;
  ownerId: number;
};

export default async function OwnerBookingDetailsByRestaurantPage({ params }: BookingDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.role || !isRestaurantOwnerRole(session.role)) {
    return <div>No permission to view this page.</div>;
  }

  const ownerId = await getCurrentOwnerId(session);

  if (!ownerId) {
    return <div>Unable to identify current owner.</div>;
  }

  const resolvedParams = await params;
  const restaurantId = Number.parseInt(resolvedParams.id, 10);

  if (!Number.isFinite(restaurantId)) {
    return <div>Invalid restaurant id.</div>;
  }

  const allRestaurants = ((await getRestaurants()) ?? []) as Restaurant[];
  const isOwnedRestaurant = allRestaurants.some((restaurant) => restaurant.id === restaurantId && restaurant.ownerId === ownerId);

  if (!isOwnedRestaurant) {
    return <div>No permission to view bookings for this restaurant.</div>;
  }

  const bookingsRaw = (await getBookingByRestaurantId(restaurantId)) as BookingRecord[];
  const bookings = bookingsRaw.map((booking) => normalizeBooking(booking));

  const bookingsWithEmail = await Promise.all(
    bookings.map(async (booking) => ({
      ...booking,
      userEmail: booking.userId !== null ? await getUserEmailById(booking.userId) : null,
    }))
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold">Booking Overview</h2>
        <Link href="/ownerdashboard/bookings">
          <button className="btn btn-primary w-full sm:w-auto">Back to my restaurants</button>
        </Link>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg bg-base-100 p-4">
        <p className="text-sm text-gray-600 mb-2">Total bookings: {bookingsWithEmail.length}</p>
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th className="text-center">Booking Id</th>
              <th className="text-center">Date / Time</th>
              <th className="text-center">Guests</th>
              <th className="text-center">Table Id</th>
              <th className="text-center">User Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookingsWithEmail.map((booking, index) => (
              <BookingTableRowComponent
                key={`${booking.id ?? "booking"}-${index}`}
                index={index}
                id={booking.id}
                dateTime={booking.dateTime}
                guestCount={booking.guestCount}
                tableId={booking.tableId}
                userEmail={booking.userEmail}
              />
            ))}
            {bookingsWithEmail.length === 0 ? (
              <tr>
                <th></th>
                <td className="text-center" colSpan={6}>No bookings found for this restaurant.</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th className="text-center">Booking Id</th>
              <th className="text-center">Date / Time</th>
              <th className="text-center">Guests</th>
              <th className="text-center">Table Id</th>
              <th className="text-center">User Email</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

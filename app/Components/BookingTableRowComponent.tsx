'use client'
import { useSession } from "next-auth/react";
import { deleteBooking } from "../api/bookings/deleteBooking";

type BookingRowProps = {
  index: number;
  id: number | null;
  dateTime: string | null;
  guestCount: number | null;
  tableId: number | null;
  userEmail: string | null;
};

const displayValue = (value: string | number | null) => (value === null ? "-" : value);

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BookingTableRowComponent({ index, id, dateTime, guestCount, tableId, userEmail }: BookingRowProps) {
  const { data: session } = useSession();

  const handleDelete = async () => {
    if (id === null) return;
    const token = session?.backendAccessToken;
    if (!token) {
      alert("You must be logged in to perform this action");
      return;
    }
    try {
      await deleteBooking(id, token);
      alert("Booking deleted successfully!");
    } catch (error) {
      console.error("Failed to delete booking", error);
    }
  };

  return (
    <tr>
      <th>{index + 1}</th>
      <td className="text-center">{displayValue(id)}</td>
      <td className="text-center">{formatDate(dateTime)}</td>
      <td className="text-center">{displayValue(guestCount)}</td>
      <td className="text-center">{displayValue(tableId)}</td>
      <td className="text-center">{displayValue(userEmail)}</td>
      <td className="text-center">
        <button
          className="btn btn-active btn-error btn-sm sm:btn-md"
          onClick={handleDelete}
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}

export type BookingRecord = Record<string, unknown>;

export type NormalizedBooking = {
  id: number | null;
  restaurantId: number | null;
  dateTime: string | null;
  guestCount: number | null;
  tableId: number | null;
  userId: number | null;
  status: string | null;
};

const getNumber = (row: BookingRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

const getString = (row: BookingRecord, keys: string[]): string | null => {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return null;
};

export const normalizeBooking = (row: BookingRecord): NormalizedBooking => ({
  id: getNumber(row, ["id", "bookingId", "reservationId"]),
  restaurantId: getNumber(row, ["restaurantId", "restaurant_id"]),
  dateTime: getString(row, [
    "bookingStart",
    "bookingDateTime",
    "reservationDateTime",
    "bookingTime",
    "reservationTime",
    "dateTime",
    "createdAt",
  ]),
  guestCount: getNumber(row, ["guestNumber", "numberOfGuests", "guestCount", "guests", "partySize"]),
  tableId: getNumber(row, ["restaurantTableId", "tableId"]),
  userId: getNumber(row, ["userId", "customerId"]),
  status: getString(row, ["status", "bookingStatus", "reservationStatus"]),
});

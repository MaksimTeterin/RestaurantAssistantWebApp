import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const API_URL = "http://localhost:8081/api";

const toBookingArray = (data: unknown): Record<string, unknown>[] => {
  if (Array.isArray(data)) {
    return data as Record<string, unknown>[];
  }

  if (data && typeof data === "object") {
    const container = data as Record<string, unknown>;
    const candidateKeys = ["bookings", "content", "items", "results", "data"];

    for (const key of candidateKeys) {
      const value = container[key];
      if (Array.isArray(value)) {
        return value as Record<string, unknown>[];
      }
    }

    if ("id" in container || "bookingId" in container || "reservationId" in container) {
      return [container];
    }
  }

  return [];
};

export async function getBookingByRestaurantId(id: number) {
  const session = await getServerSession(authOptions);
  const token = session?.backendAccessToken;
  const role = session?.role;

  console.log(role)

  if (!token) {
    console.warn("Unauthorized: No backend token found in session");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/bookings/restaurantId/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", 
    });

    console.log(`Fetch response status: ${res.status}`);
    if (!res.ok) {
        console.error(`Backend fetch failed: ${res.status}`);
        return [];
    }

    const data = await res.json();
    const normalizedData = toBookingArray(data);
    
    console.log("Bookings fetched successfully");
    console.log(normalizedData);
    return normalizedData;

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
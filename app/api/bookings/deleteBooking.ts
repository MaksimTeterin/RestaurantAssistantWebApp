type Restaurant = {
    id: number;
    name: string
    address: string
    phone: string
    generalDescription: string
    ownerId: number
}

const API_URL = "http://localhost:8081/api";

export async function deleteBooking(bookingId: number, token: string) {
    console.log("Deleting booking with data:", token, bookingId);
  if (!token) {
    console.warn("Unauthorized: No backend token found in session");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", 
    });

    if (!res.ok) {
        console.error(`Backend fetch failed: ${res.status}`);
        return null;
    }

    const data = await res.json();
    console.log(data)
    
    console.log("Booking deleted successfully");
    return data; 

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
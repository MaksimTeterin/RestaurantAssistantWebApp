type BusinessDay = {
    dayOfWeek: string;
    isOperating: boolean;
    openTime: string;
    closeTime: string;
    restaurantId: number;
}

const API_URL = "http://localhost:8081/api";

export async function getBusinessDaysByRestaurantId(restaurantId: number, token: string) {
  if (!token) {
    console.warn("Unauthorized: No backend token provided");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/businessdays/restaurant/${restaurantId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
        console.error(`Backend fetch failed: ${res.status}`);
        return [];
    }

    const data = await res.json();

    console.log("Business days fetched successfully");
    return data;

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
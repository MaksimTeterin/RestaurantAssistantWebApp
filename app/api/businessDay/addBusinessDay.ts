type BusinessDay = {
    id: number;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    restaurantId: number;
};


const API_URL = "http://localhost:8081/api";

export async function addBusinessDay(businessDay: Omit<BusinessDay, 'id'>, token: string) {
  console.log("Business day data:", businessDay);

  if (!token) {
    console.warn("Unauthorized: No backend token provided");
    return null;
  }

  try {
    const payload = {
      dayOfWeek: businessDay.dayOfWeek,
      openTime: businessDay.openTime,
      closeTime: businessDay.closeTime,
      restaurantId: businessDay.restaurantId,
    };

    const res = await fetch(`${API_URL}/businessdays`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
        console.error(`Backend fetch failed: ${res.status}`);
        return [];
    }

    const data = await res.json();
    
    console.log("Business day added successfully");
    return data; 

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
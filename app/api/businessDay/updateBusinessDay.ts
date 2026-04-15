type BusinessDay = {
    id: number;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    restaurantId: number;
}

const API_URL = "http://localhost:8081/api";

export async function updateBusinessDay(updatedBusinessDay: BusinessDay, token: string) {
  if (!token) {
    console.warn("Unauthorized: No backend token provided");
    return null;
  }

  try {
    const payload = {
      id: updatedBusinessDay.id,
      dayOfWeek: updatedBusinessDay.dayOfWeek,
      openTime: updatedBusinessDay.openTime,
      closeTime: updatedBusinessDay.closeTime,
      restaurantId: updatedBusinessDay.restaurantId,
    };

    const res = await fetch(`${API_URL}/businessdays/${updatedBusinessDay.id}`, {
      method: "PUT",
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
    
    console.log("Business day updated successfully");
    return data; 

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
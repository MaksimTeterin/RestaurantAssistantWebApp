type Restaurant = {
    id: number;
    name: string
    address: string
    phone: string
    generalDescription: string
    ownerId: number
}

const API_URL = "http://localhost:8081/api";

export async function addRestaurant(restaurant: Omit<Restaurant, 'id'>, token: string) {
  if (!token) {
    console.warn("Unauthorized: No backend token provided");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/restaurants`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(restaurant),
      cache: "no-store",
    });

    if (!res.ok) {
        console.error(`Backend fetch failed: ${res.status}`);
        return [];
    }

    const data = await res.json();
    
    console.log("Restaurant added successfully");
    return data; 

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
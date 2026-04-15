type Restaurant = {
    id: number;
    name: string
    address: string
    phone: string
    generalDescription: string
    ownerId: number
}

const API_URL = "http://localhost:8081/api";

export async function deleteRestaurant(updatedRestaurant: Restaurant, token: string) {
    console.log("Deleting restaurant with data:", token, updatedRestaurant);
  if (!token) {
    console.warn("Unauthorized: No backend token found in session");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/restaurants/${updatedRestaurant.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRestaurant),
      cache: "no-store", 
    });

    if (!res.ok) {
        console.error(`Backend fetch failed: ${res.status}`);
        return [];
    }

    const data = await res.json();
    console.log(data)
    
    console.log("Restaurant deleted successfully");
    return data; 

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
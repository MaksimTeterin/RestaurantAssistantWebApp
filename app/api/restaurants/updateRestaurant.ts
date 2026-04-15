import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

type Restaurant = {
    id: number;
    name: string
    address: string
    phone: string
    generalDescription: string
    ownerId: number
}

const API_URL = "http://localhost:8081/api";

export async function updateRestaurant(updatedRestaurant: Restaurant, token: string) {
  const session = await getServerSession(authOptions);
  const role = session?.role;

  console.log(role)

  if (!token) {
    console.warn("Unauthorized: No backend token found in session");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/restaurants/${updatedRestaurant.id}`, {
      method: "PUT",
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
    
    console.log("Restaurant updated successfully");
    return data; 

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
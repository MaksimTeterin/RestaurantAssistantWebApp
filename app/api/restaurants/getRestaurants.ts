import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const API_URL = "http://localhost:8081/api";

export async function getRestaurants() {
  const session = await getServerSession(authOptions);
  const token = session?.backendAccessToken;
  const role = session?.role;

  console.log(role)

  if (!token) {
    console.warn("Unauthorized: No backend token found in session");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/restaurants`, {
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
    
    console.log("Restaurants fetched successfully");
    return data; 

  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}
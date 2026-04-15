interface Table {
    id: number;
    capacity: number;
    restaurantId: number;
}

const API_URL = "http://localhost:8081/api";

export async function deleteRestaurantTable(tableId: number, token: string) {
  if (!token) {
    return null;
  }
  try {
    const res = await fetch(`${API_URL}/restauranttables/${tableId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    if (!res.ok) {
        return [];
    }
    const data = await res.json();
    return data; 
  } catch (e) {
    return [];
  }
}
}
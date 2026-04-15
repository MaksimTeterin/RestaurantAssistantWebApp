interface Table {
    id: number;
    capacity: number;
    restaurantId: number;
}

const API_URL = "http://localhost:8081/api";

export async function updateRestaurantTable(updatedRestaurantTable: Table, token: string) {
  if (!token) {
    return null;
  }
  try {
    const res = await fetch(`${API_URL}/restauranttables/${updatedRestaurantTable.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRestaurantTable),
      cache: "no-store",
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
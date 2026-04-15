interface Table {
    id: number;
    capacity: number;
    restaurantId: number;
}

const API_URL = "http://localhost:8081/api";

export async function addRestaurantTable(table: Omit<Table, 'id'>, token: string) {
  if (!token) {
    return null;
  }
  try {
    const res = await fetch(`${API_URL}/restauranttables`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(table),
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
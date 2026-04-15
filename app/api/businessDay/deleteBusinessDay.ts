const API_URL = "http://localhost:8081/api";

export async function deleteBusinessDay(businessDayId: number, token: string) {
  if (!token) {
    console.warn("Unauthorized: No backend token provided");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/businessdays/${businessDayId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`Backend fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    console.log("Business day deleted successfully");
    return data;
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

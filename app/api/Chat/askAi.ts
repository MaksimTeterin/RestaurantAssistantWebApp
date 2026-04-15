const API_URL = "http://localhost:8081/api";

export async function askAi(prompt: string, restaurantId: number, token: string, userEmail: string) {
  if (!token) {
    console.warn("Unauthorized: No backend token provided");
    return null;
  }

  try {
    const query = new URLSearchParams({
      prompt,
      userEmail,
    });

    const res = await fetch(`${API_URL}/ask-ai/${restaurantId}?${query.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "text/plain",
      },
      cache: "no-store",
    });

    if (!res.ok) {
        const errorText = (await res.text()).trim();
        console.error(`Backend fetch failed: ${res.status}${errorText ? ` - ${errorText}` : ""}`);
        return null;
    }

    const reply = (await res.text()).trim();
    return reply || null;

  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}
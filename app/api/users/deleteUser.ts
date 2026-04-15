type User = {
    id: number;
    firstName: string
    lastName: string
    email: string
    userRoles: string
}

const API_URL = "http://localhost:8081/api";

export async function deleteUser(updatedUser: User, token: string) {
  if (!token) {
    return null;
  }
  try {
    const res = await fetch(`${API_URL}/users/${updatedUser.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
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
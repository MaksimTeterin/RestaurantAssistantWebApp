import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const API_URL = "http://localhost:8081/api";

export async function getUserEmailById(userId: number, token?: string) {
  let finalToken = token;
  if (!finalToken) {
    const session = await getServerSession(authOptions);
    finalToken = session?.backendAccessToken;
  }
  if (!finalToken) {
    return null;
  }
  try {
    const res = await fetch(`${API_URL}/users/getUserEmailById/${userId}`, {
      headers: {
        "Authorization": `Bearer ${finalToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.text();
    return data || null;
  } catch (e) {
    return null;
  }
}
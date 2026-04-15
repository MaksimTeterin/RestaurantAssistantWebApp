import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const API_URL = "http://localhost:8081/api";

export async function getUsers(token?: string) {
  let finalToken = token;
  if (!finalToken) {
    const session = await getServerSession(authOptions);
    finalToken = session?.backendAccessToken;
  }
  if (!finalToken) {
    return [];
  }
  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: {
        "Authorization": `Bearer ${finalToken}`,
        "Content-Type": "application/json",
      },
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
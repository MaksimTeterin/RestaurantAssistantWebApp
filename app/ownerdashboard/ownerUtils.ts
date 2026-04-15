import { getUsers } from "@/app/api/users/getUsers";
import type { Session } from "next-auth";

type UserRecord = {
  id: number;
  email: string;
};

const parseTokenPayload = (token?: string): Record<string, unknown> | null => {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    if (payload && typeof payload === "object") {
      return payload as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getUserIdFromSession = (session: Session): number | null => {
  const fromSession = toNumberOrNull(session.user?.id);
  if (fromSession !== null) {
    return fromSession;
  }

  const payload = parseTokenPayload(session.backendAccessToken);
  if (!payload) {
    return null;
  }

  return (
    toNumberOrNull(payload.userId) ??
    toNumberOrNull(payload.id) ??
    toNumberOrNull(payload.sub)
  );
};

export const isRestaurantOwnerRole = (role?: string) =>
  role === "ROLE_RESTAURANT_ADMIN" || role === "ROLE_RESTAURANT_OWNER";

export const getCurrentOwnerId = async (session: Session): Promise<number | null> => {
  const directId = getUserIdFromSession(session);
  if (directId !== null) {
    return directId;
  }

  if (!session.user?.email) {
    return null;
  }

  const users = (await getUsers(session.backendAccessToken)) as UserRecord[];
  const current = users.find((user) => user.email?.toLowerCase() === session.user?.email?.toLowerCase());
  return current?.id ?? null;
};

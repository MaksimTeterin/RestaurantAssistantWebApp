"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { addRestaurantTable } from "../../../api/restaurantTable/addRestaurantTable";
import { updateRestaurantTable } from "../../../api/restaurantTable/updateRestaurantTable";
import { deleteRestaurantTable } from "../../../api/restaurantTable/deleteRestaurantTable";
import { getRestaurantTablesByRestaurantId } from "../../../api/restaurantTable/getRestaurantTablesByRestaurantId";
import { addBusinessDay } from "../../../api/businessDay/addBusinessDay";
import { updateBusinessDay as updateBusinessDayApi } from "../../../api/businessDay/updateBusinessDay";
import { deleteBusinessDay as deleteBusinessDayApi } from "../../../api/businessDay/deleteBusinessDay";
import { getBusinessDaysByRestaurantId } from "../../../api/businessDay/getBusinessDaysByRestaurantId";

interface Table {
  id: number;
  capacity: number;
  restaurantId: number;
}

type BusinessDay = {
  id: number;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  restaurantId: number;
};

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  generalDescription: string;
  ownerId: number;
}

const API_URL = "http://localhost:8081/api";
const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const emptyRestaurant: Restaurant = {
  id: 0,
  name: "",
  address: "",
  phone: "",
  generalDescription: "",
  ownerId: 0,
};

const toApiTime = (time: string) => (time.length === 5 ? `${time}:00` : time);
const toInputTime = (time: string) => (time ? time.slice(0, 5) : "");

const normalizeBusinessDay = (value: unknown): BusinessDay | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as {
    id?: unknown;
    dayOfWeek?: unknown;
    openTime?: unknown;
    closeTime?: unknown;
    restaurantId?: unknown;
    restautantId?: unknown;
  };

  const openTime = typeof row.openTime === "string" ? row.openTime : "";
  const closeTime = typeof row.closeTime === "string" ? row.closeTime : "";

  	const idValue = typeof row.id === "number" ? row.id : Number.parseInt(String(row.id ?? "0"), 10);
  	const restaurantIdValue =
   		typeof row.restaurantId === "number"
   			? row.restaurantId
   			: typeof row.restautantId === "number"
   				? row.restautantId
   				: Number.parseInt(String(row.restaurantId ?? row.restautantId ?? "0"), 10);

  	return {
   		id: Number.isNaN(idValue) ? 0 : idValue,
    dayOfWeek: typeof row.dayOfWeek === "string" ? row.dayOfWeek : "",
    openTime,
    closeTime,
   		restaurantId: Number.isNaN(restaurantIdValue) ? 0 : restaurantIdValue,
  };
};

const normalizeBusinessDays = (payload: unknown): BusinessDay[] =>
  asArray<unknown>(payload)
    .map((row) => normalizeBusinessDay(row))
    .filter((row): row is BusinessDay => row !== null);
const asArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const maybeData = payload as { data?: unknown; items?: unknown; content?: unknown };
    if (Array.isArray(maybeData.data)) {
      return maybeData.data as T[];
    }
    if (Array.isArray(maybeData.items)) {
      return maybeData.items as T[];
    }
    if (Array.isArray(maybeData.content)) {
      return maybeData.content as T[];
    }
  }

  return [];
};

export default function RestaurantManagementPage() {
  const params = useParams();
  const { data: session } = useSession();
  const token = session?.backendAccessToken;

  const restaurantId = Number.parseInt(String(params?.id ?? "0"), 10);

  const [restaurant, setRestaurant] = useState<Restaurant>(emptyRestaurant);
  const [tables, setTables] = useState<Table[]>([]);
  const [businessDays, setBusinessDays] = useState<BusinessDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newTableCapacity, setNewTableCapacity] = useState(2);
  const [newBusinessDay, setNewBusinessDay] = useState({
    dayOfWeek: "MONDAY",
    openTime: "09:00",
    closeTime: "17:00",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!token || !restaurantId || Number.isNaN(restaurantId)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [restaurantRes, tablesRes, businessDaysRes] = await Promise.all([
          fetch(`${API_URL}/restaurants/${restaurantId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }),
          getRestaurantTablesByRestaurantId(restaurantId, token),
          getBusinessDaysByRestaurantId(restaurantId, token),
        ]);

        if (!restaurantRes.ok) {
          throw new Error(`Failed to fetch restaurant (${restaurantRes.status})`);
        }

        const restaurantData = await restaurantRes.json();
        setRestaurant(restaurantData);
        setTables(asArray<Table>(tablesRes));
        setBusinessDays(normalizeBusinessDays(businessDaysRes));
      } catch (e) {
        console.error(e);
        setError("Failed to load restaurant data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [restaurantId, token]);

  const addTable = async () => {
    if (!token) {
      setError("You must be logged in to perform this action.");
      return;
    }

    if (newTableCapacity < 1) {
      return;
    }

    setIsSaving(true);
    try {
      const createdTable = await addRestaurantTable(
        {
          capacity: newTableCapacity,
          restaurantId: restaurant.id,
        },
        token,
      );

      if (createdTable && typeof createdTable.id === "number") {
        setTables((prev) => [...prev, createdTable]);
      } else {
        const refreshed = await getRestaurantTablesByRestaurantId(restaurant.id, token);
        setTables(asArray<Table>(refreshed));
      }
      setNewTableCapacity(2);
    } catch (e) {
      console.error(e);
      setError("Failed to add table.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTable = async (id: number) => {
    if (!token) {
      setError("You must be logged in to perform this action.");
      return;
    }

    setIsSaving(true);
    try {
      await deleteRestaurantTable(id, token);
      setTables((prev) => prev.filter((table) => table.id !== id));
    } catch (e) {
      console.error(e);
      setError("Failed to delete table.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateTableCapacity = async (id: number, capacity: number) => {
    if (!token) {
      setError("You must be logged in to perform this action.");
      return;
    }

    const nextCapacity = Math.max(1, capacity);
    const target = tables.find((table) => table.id === id);
    if (!target) {
      return;
    }

    setTables((prev) => prev.map((table) => (table.id === id ? { ...table, capacity: nextCapacity } : table)));

    try {
      await updateRestaurantTable({ ...target, capacity: nextCapacity }, token);
    } catch (e) {
      console.error(e);
      setError("Failed to update table.");
      setTables((prev) => prev.map((table) => (table.id === id ? target : table)));
    }
  };

  const updateBusinessDay = async (id: number, updatedDay: BusinessDay) => {
    if (!token) {
      setError("You must be logged in to perform this action.");
      return;
    }

    const previous = businessDays.find((day) => day.id === id);
    if (!previous) {
      return;
    }

    setBusinessDays((prev) => prev.map((day) => (day.id === id ? updatedDay : day)));

    try {
      await updateBusinessDayApi(
        {
          id: updatedDay.id,
          dayOfWeek: updatedDay.dayOfWeek,
          openTime: toApiTime(updatedDay.openTime),
          closeTime: toApiTime(updatedDay.closeTime),
          restaurantId: updatedDay.restaurantId,
        },
        token,
      );
    } catch (e) {
      console.error(e);
      setError("Failed to update business day.");
      setBusinessDays((prev) => prev.map((day) => (day.id === id ? previous : day)));
    }
  };

  const addBusinessDayHandler = async () => {
    if (!token) {
      setError("You must be logged in to perform this action.");
      return;
    }

    if (businessDays.some((day) => day.dayOfWeek === newBusinessDay.dayOfWeek)) {
      setError("This day already exists for the restaurant.");
      return;
    }

    if (!newBusinessDay.openTime || !newBusinessDay.closeTime) {
      setError("Please set both open and close time.");
      return;
    }

    if (newBusinessDay.openTime >= newBusinessDay.closeTime) {
      setError("Open time must be earlier than close time.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const createdDay = await addBusinessDay(
        {
          dayOfWeek: newBusinessDay.dayOfWeek,
          openTime: toApiTime(newBusinessDay.openTime),
          closeTime: toApiTime(newBusinessDay.closeTime),
          restaurantId: restaurant.id,
        },
        token,
      );

      if (createdDay && typeof createdDay === "object") {
        const normalized = normalizeBusinessDay(createdDay);
        if (normalized) {
          setBusinessDays((prev) => [...prev, normalized]);
         } else {
           const refreshed = await getBusinessDaysByRestaurantId(restaurant.id, token);
           setBusinessDays(normalizeBusinessDays(refreshed));
        }
      } else {
        const refreshed = await getBusinessDaysByRestaurantId(restaurant.id, token);
        setBusinessDays(normalizeBusinessDays(refreshed));
      }
    } catch (e) {
      console.error(e);
      setError("Failed to add business day.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBusinessDay = async (id: number) => {
    if (!token) {
      setError("You must be logged in to perform this action.");
      return;
    }

    setIsSaving(true);
    try {
      await deleteBusinessDayApi(id, token);
      setBusinessDays((prev) => prev.filter((day) => day.id !== id));
    } catch (e) {
      console.error(e);
      setError("Failed to delete business day.");
    } finally {
      setIsSaving(false);
    }
  };

  const normalizedBusinessDays = useMemo(
    () =>
      businessDays.map((day) => ({
        ...day,
        openTime: toInputTime(day.openTime),
        closeTime: toInputTime(day.closeTime),
      })),
    [businessDays],
  );

  if (isLoading) {
    return <div className="p-4 sm:p-8">Loading restaurant data...</div>;
  }

  if (!token) {
    return <div className="p-4 sm:p-8">You must be logged in to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">Restaurant Management</h1>
        {error && <div className="mb-6 rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>}

        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Restaurant Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Name:</label>
              <p className="text-gray-700">{restaurant.name || "-"}</p>
            </div>
            <div>
              <label className="block font-semibold">Address:</label>
              <p className="text-gray-700">{restaurant.address || "-"}</p>
            </div>
            <div>
              <label className="block font-semibold">Phone:</label>
              <p className="text-gray-700">{restaurant.phone || "-"}</p>
            </div>
            <div>
              <label className="block font-semibold">Owner ID:</label>
              <p className="text-gray-700">{restaurant.ownerId || "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold">Description:</label>
              <p className="text-gray-700">{restaurant.generalDescription || "-"}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Manage Tables</h2>
          <p className="mb-4 text-sm text-gray-600">Fetched tables: {tables.length}</p>
          <div className="mb-6 border-b pb-6">
            <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
              <div>
                <label className="block font-semibold mb-2">Capacity:</label>
                <input
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number.parseInt(e.target.value || "0", 10))}
                  className="border px-3 py-2 rounded w-24"
                  min="1"
                />
              </div>
              <button
                onClick={() => void addTable()}
                disabled={isSaving}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-60"
              >
                Add Table
              </button>
            </div>
          </div>
          {tables.length === 0 ? (
            <p className="text-gray-600">No tables found for this restaurant yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map((table) => (
                <div key={table.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 sm:items-start">
                    <div>
                      <p className="font-bold text-lg">Table ID {table.id}</p>
                      <label className="text-sm text-gray-700 mr-2">Capacity:</label>
                      <input
                        type="number"
                        min="1"
                        value={table.capacity}
                        onChange={(e) =>
                          void updateTableCapacity(table.id, Number.parseInt(e.target.value || "1", 10))
                        }
                        className="border px-2 py-1 rounded w-20"
                      />
                    </div>
                    <button
                      onClick={() => void deleteTable(table.id)}
                      className="btn btn-error btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Manage Business Days</h2>
          <p className="mb-4 text-sm text-gray-600">Fetched business days: {normalizedBusinessDays.length}</p>
          <div className="mb-6 border-b pb-6">
            <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
              <div>
                <label className="block font-semibold mb-2">Day:</label>
                <select
                  value={newBusinessDay.dayOfWeek}
                  onChange={(e) =>
                    setNewBusinessDay((prev) => ({
                      ...prev,
                      dayOfWeek: e.target.value,
                    }))
                  }
                  className="border px-3 py-2 rounded"
                >
                  {weekDays.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">Open:</label>
                <input
                  type="time"
                  value={newBusinessDay.openTime}
                  onChange={(e) =>
                    setNewBusinessDay((prev) => ({
                      ...prev,
                      openTime: e.target.value,
                    }))
                  }
                  className="border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Close:</label>
                <input
                  type="time"
                  value={newBusinessDay.closeTime}
                  onChange={(e) =>
                    setNewBusinessDay((prev) => ({
                      ...prev,
                      closeTime: e.target.value,
                    }))
                  }
                  className="border px-3 py-2 rounded"
                />
              </div>
              <button
                onClick={() => void addBusinessDayHandler()}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                Add Business Day
              </button>
            </div>
          </div>
          {normalizedBusinessDays.length === 0 ? (
            <p className="text-gray-600">No business days yet. Add one using the form above.</p>
          ) : (
            <div className="space-y-4">
              {normalizedBusinessDays.map((day) => (
                <div key={day.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[110px_1fr_auto_auto_auto_auto] gap-3 sm:gap-4 items-center border-b pb-4">
                  <div className="font-semibold">{day.dayOfWeek.charAt(0) + day.dayOfWeek.slice(1).toLowerCase()}</div>
                  <div className="text-sm text-gray-700">
                    Working hours: {day.openTime && day.closeTime ? `${day.openTime} - ${day.closeTime}` : "Not set"}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) =>
                        void updateBusinessDay(day.id, {
                          ...day,
                          openTime: e.target.value,
                        })
                      }
                      className="border px-3 py-1 rounded w-full sm:w-auto"
                    />
                  </div>
                  <span className="text-center sm:text-left">to</span>
                  <div>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) =>
                        void updateBusinessDay(day.id, {
                          ...day,
                          closeTime: e.target.value,
                        })
                      }
                      className="border px-3 py-1 rounded w-full sm:w-auto"
                    />
                  </div>
                  <button
                    onClick={() => void deleteBusinessDay(day.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 w-full sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

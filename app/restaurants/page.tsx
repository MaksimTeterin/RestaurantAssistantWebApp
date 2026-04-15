import Link from "next/link";
import { getRestaurants } from "../api/restaurants/getRestaurants";
type Restaurant = {
    id: number;
    name: string;
    address: string;
    phone: string;
    generalDescription: string;
    ownerId: number;
};
const DESCRIPTION_PREVIEW_LENGTH = 120;
const truncateDescription = (value: string) => {
    if (!value) {
        return "No description provided.";
    }
    if (value.length <= DESCRIPTION_PREVIEW_LENGTH) {
        return value;
    }
    return `${value.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}...`;
};
const getDescription = (value: string) => value || "No description provided.";
export default async function RestaurantsPage() {
    const data = await getRestaurants();
    const restaurants = Array.isArray(data) ? (data as Restaurant[]) : [];
    if (!data) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <section className="mx-auto max-w-5xl rounded-xl border border-amber-300 bg-amber-50 p-6">
                    <h1 className="text-2xl font-bold text-amber-900">Restaurants</h1>
                    <p className="mt-2 text-amber-800">You need to be logged in to view restaurants.</p>
                </section>
            </main>
        );
    }
    if (restaurants.length === 0) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <section className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">Restaurants</h1>
                    <p className="mt-2 text-slate-600">No restaurants found yet.</p>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <section className="mx-auto max-w-6xl">
                <header className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">All Restaurants</h1>
                    <p className="mt-2 text-slate-600">Found {restaurants.length} restaurant(s).</p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {restaurants.map((restaurant) => (
                        <article key={restaurant.id} className="relative flex h-full flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <h2 className="text-lg font-semibold text-slate-900">{restaurant.name}</h2>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                    #{restaurant.id}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-slate-700">
                                <p><span className="font-semibold text-slate-900">Address:</span> {restaurant.address || "-"}</p>
                                <p><span className="font-semibold text-slate-900">Phone:</span> {restaurant.phone || "-"}</p>
                            </div>

                            <div className="mt-4 flex flex-1 flex-col border-t border-slate-200 pt-3">
                                <p className="text-xs sm:text-sm text-slate-600">{truncateDescription(restaurant.generalDescription)}</p>
                                {restaurant.generalDescription && restaurant.generalDescription.length > DESCRIPTION_PREVIEW_LENGTH && (
                                    <details className="relative mt-2">
                                        <summary className="cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900">
                                            Show full description
                                        </summary>
                                        <div className="absolute left-0 top-full z-20 mt-2 w-[min(28rem,calc(100vw-3rem))] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                                            <p className="max-h-64 overflow-auto text-xs sm:text-sm text-slate-600">{getDescription(restaurant.generalDescription)}</p>
                                        </div>
                                    </details>
                                )}

                                <div className="mt-auto pt-4">
                                    <Link href={`/restaurants/${restaurant.id}/chat`} className="btn btn-primary btn-sm w-full">
                                        Contact
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}


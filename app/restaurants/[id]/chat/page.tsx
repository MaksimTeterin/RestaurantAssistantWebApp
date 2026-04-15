import Link from "next/link";
import RestaurantChatClient from "@/app/Components/RestaurantChatClient";
import { getRestaurantById } from "../../../api/restaurants/getRestaurantById";

type ChatPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function RestaurantChatPage({ params }: ChatPageProps) {
    const { id } = await params;
    const restaurantId = Number.parseInt(id, 10);
    const restaurant = Number.isNaN(restaurantId) ? null : await getRestaurantById(restaurantId);

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <section className="mx-auto max-w-4xl rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        {restaurant?.name ? `Chat with ${restaurant.name}` : "Restaurant Chat"}
                    </h1>
                    <Link href="/restaurants" className="btn btn-ghost btn-sm">
                        Back
                    </Link>
                </div>
                <RestaurantChatClient
                    restaurantName={restaurant?.name || "this restaurant"}
                />
            </section>
        </main>
    );
}

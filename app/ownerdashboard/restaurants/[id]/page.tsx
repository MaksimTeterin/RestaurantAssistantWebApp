import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRestaurants } from "@/app/api/restaurants/getRestaurants";
import RestaurantManagementPage from "@/app/admindashboard/restaurants/[id]/page";
import { getCurrentOwnerId, isRestaurantOwnerRole } from "../../ownerUtils";

type OwnerRestaurantDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Restaurant = {
  id: number;
  ownerId: number;
};

export default async function OwnerRestaurantDetailsPage({ params }: OwnerRestaurantDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.role || !isRestaurantOwnerRole(session.role)) {
    return <div>No permission to view this page.</div>;
  }

  const ownerId = await getCurrentOwnerId(session);

  if (!ownerId) {
    return <div>Unable to identify current owner.</div>;
  }

  const resolvedParams = await params;
  const restaurantId = Number.parseInt(resolvedParams.id, 10);

  if (!Number.isFinite(restaurantId)) {
    return <div>Invalid restaurant id.</div>;
  }

  const allRestaurants = ((await getRestaurants()) ?? []) as Restaurant[];
  const isOwnedRestaurant = allRestaurants.some((restaurant) => restaurant.id === restaurantId && restaurant.ownerId === ownerId);

  if (!isOwnedRestaurant) {
    return <div>No permission to manage this restaurant.</div>;
  }

  return <RestaurantManagementPage />;
}

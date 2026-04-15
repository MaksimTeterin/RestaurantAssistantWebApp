import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import RestaurantsTableRowComponent from "../../Components/RestaurantsTableRowComponent";
import UsersTableRowComponent from "../../Components/UsersTableRowComponent";
import { getRestaurants } from "../../api/restaurants/getRestaurants";
import { getUsers } from "../../api/users/getUsers";
import { getServerSession } from "next-auth";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userRoles: string;
};

type Restaurant = {
    id: number;
    name: string
    address: string
    phone: string
    generalDescription: string
    ownerId: number
}

export default async function admindashboard() {

  const session = await getServerSession(authOptions);
    console.log("Session data:", session?.role);
      if (!session?.role || (session.role != "ROLE_RESTAURANT_ADMIN" && session.role != "ROLE_SYSTEM_ADMIN")) {
    return <div>No permission to view this page.</div>;
  }

  const userData = await getUsers();
  



  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">User Management</h2>
      <div className="overflow-x-auto shadow-md rounded-lg bg-base-100 p-4">
        <p className="text-sm text-gray-600 mb-2">Total users: {userData.length}</p>
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th className="text-center">Id</th>
              <th className="text-center">First name</th>
              <th className="text-center">Last name</th>
              <th className="text-center">Email</th>
              <th className="text-center">User Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user: User) => (
              <UsersTableRowComponent
                key={user.id}
                id={user.id}
                firstName={user.firstName}
                lastName={user.lastName}
                email={user.email}
                userRoles={user.userRoles}
              ></UsersTableRowComponent>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th className="text-center">Id</th>
              <th className="text-center">First name</th>
              <th className="text-center">Last name</th>
              <th className="text-center">Email</th>
              <th className="text-center">User Role</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

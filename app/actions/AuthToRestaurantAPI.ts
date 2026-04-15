import crypto from "crypto";

export default async function AuthToRestaurantAPI(email: string, fullName: string) {
    const timestamp = Date.now();
    const signature = crypto
        .createHmac("sha256", process.env.NEXT_PUBLIC_RESTAURANTAPIAUTH_SECRET!)
        .update(email + timestamp)
        .digest("hex");

    const res = await fetch("http://localhost:8081/api/auth/getToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            fullName,
            timestamp,
            signature,
        })
    });

    if (!res.ok) {
        throw new Error("Backend returned status " + res.status);
    }

    const data = await res.json()
    console.log(data)
    return data
}

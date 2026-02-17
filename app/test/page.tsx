'use client'
import { createOrder } from "@/app/actions/createOrder";

export default function TestPage() {
    const handleTest = async () => {
        const result = await createOrder({
            name: "John Doe",
            mobileNumber: "1234567890",
            location: "123 Main St",
            locationId: 1,
            slimCount: 1,
            roundCount: 1,
            payment_mode: "Cash",
            transaction_type: "Call-in"
        });
        console.log(result);
    };

    return <button onClick={handleTest}>Run Server Action</button>;
}
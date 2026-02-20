'use client'
import { createOnlineOrder } from "@/app/actions/createOnlineOrder";

export default function TestPage() {
    const handleTest = async () => {
        const result = await createOnlineOrder({
            slimCount: 1,
            roundCount: 1,
            payment_mode: "Cash",
            transaction_type: "Online"
        });
        console.log(result);
    };

    return <button onClick={handleTest}>Run Server Action</button>;
}
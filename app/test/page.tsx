'use client'
import { createOnlineOrder } from "@/app/actions/createOnlineOrder";

export default function TestPage() {
   const handleTest = () => {
    console.log('hello');
   }

    return <button onClick={handleTest}>Run Server Action</button>;
}
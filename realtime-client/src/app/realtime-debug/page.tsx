import RealtimeClient from "./_ui/realtime-client";

export default function RealtimePage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Realtime Messages (Next.js v15 App Router)</h1>
      <RealtimeClient />
    </main>
  );
}

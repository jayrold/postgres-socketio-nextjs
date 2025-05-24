import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { SessionProvider } from "~/contexts/session-context";
import { RealtimeMessages } from "./_ui/realtime-messages";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    return (
        <SessionProvider session={session}>
            <RealtimeMessages />
            {children}
        </SessionProvider>
    );
}  
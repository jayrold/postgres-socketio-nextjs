import { UserSelectionForm } from "../_ui/user-selection-form";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateMessagePage() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r">
        <div className="flex items-center space-x-2 border-b p-4">
          <Link href="/chat">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-lg font-semibold">New Message</h2>
        </div>
        <UserSelectionForm />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Select a user</h3>
          <p className="text-sm text-muted-foreground">
            Choose a user to start a new conversation
          </p>
        </div>
      </div>
    </div>
  );
}

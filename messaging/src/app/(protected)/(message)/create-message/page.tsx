import { UserSelectionForm } from "../_ui/user-selection-form";

export default function CreateMessagePage() {
  return (
    <div className="container mx-auto h-screen max-w-4xl">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">New Message</h1>
        </div>
        <UserSelectionForm />
      </div>
    </div>
  );
}

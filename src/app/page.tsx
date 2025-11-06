import LogoutButton from "@/app/logout-button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Page = async () => {
  await requireAuth();
  const user = await caller.getUsers();
  return (
    <div className="min-w-full min-h-screen flex items-center justify-center">
      Protected server component
      {JSON.stringify(user, null, 2)}
      <LogoutButton />
    </div>
  );
};

export default Page;

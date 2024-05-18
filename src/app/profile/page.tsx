import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Profile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm cursor-pointer">
            <div className="flex items-center gap-4">
              <img className="mx-auto h-10 w-auto rounded-full" src="/android-chrome-192x192.png" alt="logo" />
              <h1>ourni</h1>
            </div>
            <AuthButton />
          </div>
        </nav>
      </div>
    </div>
  );
}

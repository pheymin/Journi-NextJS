import AuthButton from '@/components/AuthButton';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
  const supabase = createClient();

  const { data: { user }, } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center justify-center min-h-screen">
      <AuthButton />
    </div>
  );
}

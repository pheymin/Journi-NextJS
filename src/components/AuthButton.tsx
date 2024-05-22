import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import * as React from "react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";

export default async function AuthButton() {
	const supabase = createClient();

	const { data: { user }, } = await supabase.auth.getUser();
	const signOut = async () => {
		"use server";
		const supabase = createClient();
		await supabase.auth.signOut();
		return redirect("/login");
	};

	if (!user) {
		return redirect("/login");
	}

	const { data: profileData, error } = await supabase.from("profiles").select().eq("id", user.id).single();

	return user ? (
		<div className="flex items-center gap-4">
			<DropdownMenu>
				<DropdownMenuTrigger>
					<div className="inline-flex items-center justify-center rounded-full outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-12 px-1 py-1">
						<img src=
							{profileData?.avatar_url ? (
								profileData.avatar_url
							) : user?.user_metadata?.avatar_url ? (
								user.user_metadata.avatar_url
							) : (
								`https://source.boringavatars.com/marble/120/${user.email}`
							)} className="object-cover size-12 rounded-full" alt="Avatar" />
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>
						<p className="text-white">
							{profileData?.username || user.user_metadata?.full_name || user.email}
						</p></DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Link href="/dashboard">Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem><form action={signOut}>
						<button className="no-underline">
							Logout
						</button>
					</form></DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	) : (
		redirect("/login")
	);
}

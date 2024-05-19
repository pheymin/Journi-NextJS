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

export default async function AuthButton() {
	const supabase = createClient();

	const { data: { user }, } = await supabase.auth.getUser();
	const signOut = async () => {
		"use server";
		const supabase = createClient();
		await supabase.auth.signOut();
		return redirect("/login");
	};

	const redirectToProfile = async () => {
		"use server";
		return redirect("/dashboard");
	};

	return user ? (
		<div className="flex items-center gap-4">
			<DropdownMenu>
				<DropdownMenuTrigger>
					<div className="inline-flex items-center justify-center rounded-full outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-12 px-1 py-1">
						{user.user_metadata ? (
							<img src={user.user_metadata.avatar_url} className="h-full rounded-full" />
						) : (
							<img src="https://source.boringavatars.com/marble/120/" className="h-full rounded-full" alt="Default Avatar" />
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>{user.user_metadata ? (
						<p className="text-white">{user.user_metadata.full_name}</p>
					) : (
						<p className="text-white">{user.email}</p>
					)}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem><form action={redirectToProfile}>
						<button className="no-underline">
							Profile
						</button></form>
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

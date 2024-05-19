import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NewTripDialog from "./components/NewTripDialog";

export default async function Page() {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/login");
	}

	return (
		<div className="flex flex-row justify-between items-center">
			<div className="flex flex-row space-x-4">
				<p className="text-4xl font-semibold">Dashboard</p>
				<NewTripDialog />
			</div>

			<div>
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
						<div className="mx-auto flex max-w-xs flex-row gap-x-2 items-end">
							<dt className="text-base leading-7">Planning</dt>
							<dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">5</dd>
						</div>
						<div className="mx-auto flex max-w-xs flex-row gap-x-2 items-end">
							<dt className="text-base leading-7">Ongoing</dt>
							<dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">5</dd>
						</div>
						<div className="mx-auto flex max-w-xs flex-row gap-x-2 items-end">
							<dt className="text-base leading-7">Finished</dt>
							<dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">5</dd>
						</div>
					</dl>
				</div>
			</div>

		</div>
	);
}

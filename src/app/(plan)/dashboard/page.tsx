import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NewTripDialog from "./components/NewTripDialog";
import ToastNotifier from "@/components/ToastNotifier";

export default async function Page({
	searchParams,
}: {
	searchParams: { status?: string; message?: string };
}) {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/login");
	}

	return (
		<>
			{searchParams.status && searchParams.message && <ToastNotifier message={searchParams.message} shouldReload={true} />}
			<div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-5">
				<div className="flex flex-row space-x-4">
					<p className="text-4xl font-semibold">Dashboard</p>
					<NewTripDialog />
				</div>

				<div>
					<div className="mx-auto max-w-7xl px-6 lg:px-8">
						<div className="grid gap-x-8 gap-y-16 text-center grid-cols-3">
							<div className="mx-auto flex max-w-xs flex-row gap-x-2 items-end">
								<div className="text-base leading-7">Planning</div>
								<div className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">5</div>
							</div>
							<div className="mx-auto flex max-w-xs flex-row gap-x-2 items-end">
								<div className="text-base leading-7">Ongoing</div>
								<div className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">5</div>
							</div>
							<div className="mx-auto flex max-w-xs flex-row gap-x-2 items-end">
								<div className="text-base leading-7">Finished</div>
								<div className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">5</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

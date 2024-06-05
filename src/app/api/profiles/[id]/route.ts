import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
	const supabase = createClient();
	const uuid = params.id;

	try {
		const formData = await request.formData();
		const full_name = formData.get('full_name');
		const username = formData.get('username');
		const website = formData.get('website');
		const avatarFile = formData.get('avatar') as File;

		let avatar_url: string | null = null;

		if (avatarFile) {
			const { data: fileData, error: fileError } = await supabase.storage.from('avatars').upload(`avatar_${uuid}`, avatarFile, {
				upsert: true,
			});

			if (fileError) {
				console.error(fileError.message);
				return NextResponse.json({ error: 'Could not upload avatar' }, { status: 400 });
			}

			const { data } = supabase.storage.from('avatars').getPublicUrl(`avatar_${uuid}`);
			avatar_url = data.publicUrl;
		}

		const updateData: { full_name: string, username: string, website: string, avatar_url?: string } = {
			full_name: full_name as string,
			username: username as string,
			website: website as string,
		};

		if (avatar_url) {
			updateData.avatar_url = avatar_url;
		}
		const { data, error } = await supabase.from('profiles').update(updateData).eq('id', uuid).single();

		if (error) {
			console.error(error.message);
			return NextResponse.json({ error: 'Could not update profile' }, { status: 400 });
		}

		return NextResponse.json(data, { status: 200 });

	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
	}
}

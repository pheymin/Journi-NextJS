import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import EditProfileDialog from "./components/EditProfileDialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'

export default async function Profile() {
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
        return redirect("/login");
    }

    const user = userData.user;
    const { data: profileData, error } = await supabase.from("profiles").select().eq("id", user.id).single();

    if (error) {
        console.error("Error fetching profile data:", error);
        return <div>Error loading profile</div>;
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <div className="inline-flex items-center justify-center rounded-full h-24 px-1 py-1">
                        <img src=
                            {profileData?.avatar_url ? (
                                profileData.avatar_url
                            ) : user?.user_metadata?.avatar_url ? (
                                user.user_metadata.avatar_url
                            ) : (
                                `https://source.boringavatars.com/marble/120/${user.email}`
                            )} className="object-cover size-24 rounded-full" alt="Avatar" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {profileData?.username && <Badge className="text-sm bg-[#baff66] text-black mb-1">@ {profileData.username}</Badge>}
                        <p className="font-bold">{profileData?.full_name || user.user_metadata?.full_name}</p>
                        {profileData?.website && (
                            <Link href={profileData.website} className="text-sm transition-colors text-white hover:text-[#99dbf5] flex flex-row items-center">
                                <span className="mr-2">
                                    <FontAwesomeIcon icon={faLink} className="w-5" />
                                </span>
                                {profileData.website}
                            </Link>)}
                        <Link href={`mailto:${user.email}`} className="text-sm transition-colors text-white hover:text-[#99dbf5] flex flex-row items-center">
                            <span className="mr-2">
                                <FontAwesomeIcon icon={faEnvelope} className="w-5" />
                            </span>
                            {user.email}
                        </Link>
                    </div>
                </CardContent>
                <CardFooter>
                    <EditProfileDialog profileData={profileData} user={user} />
                </CardFooter>
            </Card>
        </div>
    );
}
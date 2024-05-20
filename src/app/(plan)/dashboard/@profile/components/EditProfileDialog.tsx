import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

export default async function EditProfileDialog({ profileData }: { profileData: any }) {
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
        return redirect("/login");
    }

    const user = userData.user;

    const handleUpdateProfile = async (formData: FormData) => {
        "use server"

        const full_name = formData.get("full-name");
        const username = formData.get("username");
        const website = formData.get("website");

        const supa = createClient();
        const { error } = await supa.from("profiles").update({
            full_name: full_name,
            username: username,
            website: website,
        }).eq("id", user.id);

        if (error) {
            return redirect("/dashboard?status=error&message=Error updating profile")
        }

        return redirect("/dashboard?status=success&message=Profile updated successfully")
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-4 flex flex-col justify-center items-center">
                                {profileData?.avatar_url ? (
                                    <img src={profileData.avatar_url} className="h-24 w-24 rounded-full" alt="Profile Avatar" />
                                ) : user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} className="h-24 w-24 rounded-full" alt="User Avatar" />
                                ) : (
                                    <img src={`https://source.boringavatars.com/marble/120/${user.email}`} className="h-24 w-24 rounded-full" alt="Default Avatar" />
                                )}
                                <Button className="text-[#baff66]" variant="link">Change profile photo</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" defaultValue={profileData?.full_name || user.user_metadata?.full_name} className="col-span-3" placeholder="Add name" name="full-name" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input id="username" defaultValue={profileData?.username} className="col-span-3" placeholder="Add username" name="username" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="website" className="text-right">
                                Website
                            </Label>
                            <Input id="website" defaultValue={profileData?.website} className="col-span-3" placeholder="Add website" name="website" />
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton
                            formAction={handleUpdateProfile}
                            className="border px-3 py-2 bg-[#baff66] rounded-md text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66]"
                            pendingText="Saving..."
                        >
                            Update Profile
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
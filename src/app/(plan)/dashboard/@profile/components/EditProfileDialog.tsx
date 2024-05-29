"use client"
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
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function EditProfileDialog({ profileData, user }: { profileData: any, user: any }) {
    const { toast } = useToast();
    if (!user) {
        return redirect("/login");
    }

    const [avatar, setAvatar] = useState<string>(profileData?.avatar_url || user?.user_metadata?.avatar_url || `https://source.boringavatars.com/marble/120/${user.email}`);

    const handleUpdateProfile = async (formData: FormData) => {
        const fileInput = document.getElementById("avatar") as HTMLInputElement | null;

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            formData.set("avatar", file);
        }else{
            formData.delete("avatar");
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/profiles/${user.id}`, {
            method: 'PATCH',
            body: formData,
        });

        if (res.ok) {
            toast({
                title: "Profile updated!",
                description: "Your profile has been updated successfully.",
            });
            window.location.reload();
        } else {
            const { error } = await res.json();
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error,
            });
        }
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
                                <div className="text-center">
                                    <label className="label">
                                        <input
                                            id="avatar"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            name="avatar"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setAvatar(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }}
                                        />
                                        <figure className="relative size-[120px]">
                                            <img
                                                src={avatar}
                                                className="cursor-pointer object-cover size-[120px] box-border rounded-full border-2 border-transparent shadow-md transition-all duration-300 ease-in-out"
                                                alt="Avatar"
                                            />
                                            <figcaption className="cursor-pointer absolute top-0 rounded-full opacity-0 bg-transparent ease-in-out h-full w-full hover:bg-black hover:bg-opacity-50 hover:opacity-100">
                                                <img
                                                    src="https://raw.githubusercontent.com/ThiagoLuizNunes/angular-boilerplate/master/src/assets/imgs/camera-white.png"
                                                    className="mt-[33px] ml-[33px] size-[50px]"
                                                    alt="Camera Icon"
                                                />
                                            </figcaption>
                                        </figure>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Display Name
                            </Label>
                            <Input id="name" defaultValue={profileData?.full_name || user.user_metadata?.full_name} className="col-span-3" placeholder="Add name" name="full_name" />
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
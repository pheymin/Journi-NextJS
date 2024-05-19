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

export default function NewTripDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="submit" className="rounded-full bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6"><span className="mr-2 text-xl">+</span>New Trip</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" value="Pedro Duarte" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input id="username" value="@peduarte" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" className="rounded-full bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6"><span className="mr-2 text-xl">+</span>New Trip</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
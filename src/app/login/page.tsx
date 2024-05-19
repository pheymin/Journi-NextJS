"use client";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { SubmitButton } from "./submit-button";
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { createClient } from "@/utils/supabase/client";

export default function Login({ searchParams }: { searchParams: { message: string } }) {
	const { toast } = useToast();
	const [authButtonState, setAuthButtonState] = useState(false);
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [magicEmail, setMagicEmail] = useState<string>('');
	const [isOpen, setIsOpen] = useState<boolean>(false);

	useEffect(() => {
		if (searchParams.message) {
			toast({ description: searchParams.message });
		}
	}, [searchParams.message, toast]);

	const signIn = async (formData: FormData) => {
		const data = {
			email: formData.get('email'),
			password: formData.get('password'),
		};

		const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/signin`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (res.ok) {
			window.location.href = '/dashboard';
		} else {
			const { error } = await res.json();
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: error,
			});
		}
	};

	const signUp = async (formData: FormData) => {
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const origin = window.location.origin;

		const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password, origin })
		});

		if (res.ok) {
			window.location.href = '/login';
		} else {
			const { error } = await res.json();
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: error,
			});
		}
	};

	const handleLoginWithOAuth = (provider: "facebook" | "google") => {
		const supabase = createClient();
		supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: location.origin + "/auth/callback",
			},
		});
	};

	const handleLoginWithMagic = async (email: string) => {
		const origin = window.location.origin;

		const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/magiclink`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, origin })
		});

		if (res.ok) {
			toast({
				title: "Magic link sent",
				description: "Check your email to continue the sign in process"
			});
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
		<div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
			<div className="mx-auto w-full max-w-sm">
				<img className="mx-auto h-28 w-auto rounded-full" src="/android-chrome-192x192.png" alt="logo" />
				<h2 className="mt-10 mb-5 text-center text-2xl font-bold leading-9 tracking-tigh">
					{authButtonState ? 'Register a new account' : 'Sign in to your account'}
				</h2>
				<Tabs defaultValue="account" className="w-[400px] mb-2">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="account">Username/Password</TabsTrigger>
						<TabsTrigger value="magic">Magic Link</TabsTrigger>
					</TabsList>
					<TabsContent value="account" className="text-left">
						<Card>
							<form>
								<CardContent className="space-y-2 mt-5">
									<div className="space-y-1">
										<Label htmlFor="email">Email</Label>
										<Input value={email} type="email" name="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
									</div>
									<div className="space-y-1">
										<Label htmlFor="password">Password</Label>
										<Input value={password} type={isOpen ? 'text' : 'password'} name="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required />
										<span>
											<FontAwesomeIcon icon={isOpen ? faEye : faEyeSlash} className='relative float-right mt-[-25px] mr-[10px] cursor-pointer' onClick={() => setIsOpen(!isOpen)} />
										</span>
									</div>
								</CardContent>
								<CardFooter className="flex flex-col space-y-4">
									<SubmitButton
										formAction={authButtonState ? signUp : signIn}
										className="border bg-[#baff66] rounded-md px-4 py-2 text-black mb-2 w-full hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66]"
										pendingText={authButtonState ? 'Signing Up...' : 'Signing In...'}
									>
										{authButtonState ? 'Sign up' : 'Sign in'}
									</SubmitButton>
									<div className="divider">or continue with</div>
									<div className='flex flex-row space-x-2 w-full'>
										<Button onClick={() => handleLoginWithOAuth("google")} variant="outline" className="w-full g_id_signin"><FontAwesomeIcon icon={faGoogle} className='mx-2' />Google</Button>
										<Button onClick={() => handleLoginWithOAuth("facebook")} variant="outline" className="w-full"><FontAwesomeIcon icon={faFacebookF} className='mx-2' />Facebook</Button>
									</div>
								</CardFooter>
							</form>
						</Card>
					</TabsContent>
					<TabsContent value="magic" className="text-left">
						<Card>
							<form>
								<CardHeader>
									<CardTitle>Magic Link</CardTitle>
									<CardDescription>
										Sign in with your email address and we'll send you a magic link.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="space-y-1">
										<Label htmlFor="email">Email</Label>
										<Input type="email" name="email" placeholder="you@example.com" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} autoComplete="email" required />
									</div>
								</CardContent>
								<CardFooter>
									<SubmitButton
										formAction={() => handleLoginWithMagic(magicEmail)}
										className="border bg-[#baff66] rounded-md px-4 py-2 text-black mb-2 w-full hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66]"
										pendingText="Sending magic link..."
									>
										Send magic link
									</SubmitButton>
								</CardFooter>
							</form>
						</Card>
					</TabsContent>
				</Tabs>
				<p className="text-center">{!authButtonState ? 'Don\'t have an account?' : 'Already a User?'}
					<Button onClick={() => setAuthButtonState(!authButtonState)} variant="link">
						{!authButtonState ? 'Sign up' : 'Log in'}
					</Button>
				</p>
			</div>
		</div>
	);
}

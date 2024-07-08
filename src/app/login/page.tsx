"use client";
import { useState, useEffect } from 'react';
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
	Card,
	CardContent,
	CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { supabaseBrowser } from "@/utils/supabase/client";

export default function Login() {
	const { toast } = useToast();
	const [authButtonState, setAuthButtonState] = useState(false);
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [isOpen, setIsOpen] = useState<boolean>(false);

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
			toast({
				title: 'Check email to continue sign in process',
			});
			const { message } = await res.json();
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
		const supabase = supabaseBrowser();
		supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: location.origin + "/auth/callback",
			},
		});
	};

	return (
		<div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
			<div className="mx-auto w-full max-w-sm">
				<img className="mx-auto h-28 w-auto rounded-full" src="/android-chrome-192x192.png" alt="logo" />
				<h2 className="mt-10 mb-5 text-center text-2xl font-bold leading-9 tracking-tigh">
					{authButtonState ? 'Register a new account' : 'Sign in to your account'}
				</h2>
				<Card>
					<form>
						<CardContent className="space-y-2 mt-5">
							<div className="space-y-1">
								<Label htmlFor="email">Email</Label>
								<Input value={email} type="email" name="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
							</div>
							<div className="space-y-1">
								<Label htmlFor="password">Password</Label>
								<Input value={password} type={isOpen ? 'text' : 'password'} name="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
								<span>
									<FontAwesomeIcon icon={isOpen ? faEye : faEyeSlash} className='relative float-right mt-[-25px] mr-[10px] cursor-pointer w-5' onClick={() => setIsOpen(!isOpen)} />
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
								<Button type='button' onClick={() => handleLoginWithOAuth("google")} variant="outline" className="w-full g_id_signin"><FontAwesomeIcon icon={faGoogle} className='mx-2 w-3'/>Google</Button>
								<Button type='button' onClick={() => handleLoginWithOAuth("facebook")} variant="outline" className="w-full"><FontAwesomeIcon icon={faFacebookF} className='mx-2 w-3'/>Facebook</Button>
							</div>
						</CardFooter>
					</form>
				</Card>
				<p className="text-center">{!authButtonState ? 'Don\'t have an account?' : 'Already a User?'}
					<Button onClick={() => setAuthButtonState(!authButtonState)} variant="link">
						{!authButtonState ? 'Sign up' : 'Log in'}
					</Button>
				</p>
			</div>
		</div>
	);
}

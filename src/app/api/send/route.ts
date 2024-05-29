import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    const sender = user.email;
    const { title, emailRedirectTo, invitees } = await request.json();
    const recipients = [ ...invitees];
    try {
        const emailPromises = recipients.map(async (email) => {
            const { data, error } = await resend.emails.send({
                from: 'Journi <onboarding@resend.dev>',
                to: email,
                subject: 'You are invited to a trip!',
                react: EmailTemplate({ sender, title, redirectUrl: emailRedirectTo }),
                text: 'You are invited to a trip! Click the link to join.',
            });

            if (error) {
                throw new Error(`Failed to send email to ${email}: ${error.message}`);
            }
            return data;
        });

        const results = await Promise.all(emailPromises);

        return new Response(JSON.stringify(results), { status: 201 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}
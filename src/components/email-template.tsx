import * as React from 'react';

interface EmailTemplateProps {
    sender: any;
    title: string;
    redirectUrl: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    sender, title, redirectUrl
}) => (
    <div>
        <h5>{sender} invited you to join the "{title}"" trip plan on Journi</h5>
        <p>Click the button below to join the trip plan</p>
        <a href={redirectUrl}>Join trip plan</a>
    </div>
);

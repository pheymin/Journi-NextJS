export default function Layout({
    children,
    plans,
    profile
}: {
    children: React.ReactNode;
    plans: React.ReactNode;
    profile: React.ReactNode;
}) {
    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-start-2 md:col-span-3">
                {children}
            </div>
            <div className="md:col-span-1">
                {profile}
            </div>
            <div className="md:col-start-2 md:col-span-3">
                {plans}
            </div>
        </div>
    );
}
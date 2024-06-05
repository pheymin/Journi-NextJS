import Main from './components/main';
export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col w-full">
            {children}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                    <Main />
                </div>
                <div className="md:col-start-2 md:col-span-1">
                    map
                </div>
            </div>
        </div>
    );
}
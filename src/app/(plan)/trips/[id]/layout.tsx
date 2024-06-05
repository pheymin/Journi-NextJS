import Header from './components/Header';
import Sidebar from '@/components/Sidebar';

export default function Layout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    return (
        <div className="flex flex-col w-full min-h-screen">
            <Header tripId={params.id} />
            <div className="flex flex-grow">
                <div className="flex">
                    <Sidebar />
                </div>
                <div className="flex-grow">
                    {children}
                </div>
                <div className="hidden md:block w-1/2">
                    map
                </div>
            </div>
        </div>
    );
}
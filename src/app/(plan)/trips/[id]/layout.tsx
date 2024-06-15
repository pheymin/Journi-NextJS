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
            <div className="flex flex-grow flex-col md:flex-row">
                <div className="order-2 md:order-1 md:flex">
                    <Sidebar trip_id={params.id} />
                </div>
                <div className="order-1 md:order-2 flex-grow ps-8 p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
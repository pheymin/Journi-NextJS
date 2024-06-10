type Props = {
    children: React.ReactNode;
    title: string;
};

export default function Section({ children, title }: Props) {
    return (
        <section className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            {children}
        </section>
    );
}
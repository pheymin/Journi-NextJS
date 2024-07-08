import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Loading() {
    return (
        <div className="flex justify-center min-h-screen items-center">
            <Loader2 className={cn('h-4 w-4 animate-spin', 'mr-2')} />
            <p>Loading...</p>
        </div>
    );
}
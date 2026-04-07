import { Head } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types'; // Add this import
import AppLayout from '@/layouts/app-layout';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Annual Meeting Reports',
        href: '/reports/annual',
    },
];
export default function Index() {
    return (
        <>
            <Head title="Annual Reports" />

            <div className="p-6">
                <h1 className="text-2xl font-semibold">Annual Reports</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Placeholder page for annual reports.
                </p>
            </div>
        </>
    );
}
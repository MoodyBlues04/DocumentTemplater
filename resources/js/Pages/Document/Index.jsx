import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function DocumentsIndex({ documents }) {
    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(route('document.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Documents</h2>}
        >
            <Head title="Documents" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <button
                                onClick={() => router.get(route('document.create'))}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded text-sm transition duration-150"
                                style={{marginBottom: '15px'}}
                            >
                                Fill documents
                            </button>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.values(documents)?.map((document) => (
                                        <tr key={document.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{document.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{document.template.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => router.get(route('document.download', document.id))}
                                                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded text-sm transition duration-150"
                                                    style={{marginRight: '10px'}}
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(document.id, document.name)}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-sm transition duration-150"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// resources/js/Pages/Documents/Create.jsx
import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DocumentsCreate({ templates }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        template_id: '',
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('document.store'), {
            preserveScroll: true,
            onSuccess: () => reset('file', 'template_id'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Fill Document</h2>}
        >
            <Head title="Fill Document" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                {/* Name Field */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.name && (
                                        <div className="text-red-600 text-sm mt-1">{errors.name}</div>
                                    )}
                                </div>

                                {/* Template Dropdown */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Template
                                    </label>
                                    <select
                                        value={data.template_id}
                                        onChange={(e) => setData('template_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">-- Choose a template --</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.template_id && (
                                        <div className="text-red-600 text-sm mt-1">{errors.template_id}</div>
                                    )}
                                </div>

                                {/* File Input (JSON, Excel, CSV) */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Document File *
                                    </label>
                                    <input
                                        type="file"
                                        accept=".json,.xlsx,.xls,.csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                        onChange={(e) => setData('file', e.target.files[0])}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100"
                                        required
                                    />
                                    {errors.file && (
                                        <div className="text-red-600 text-sm mt-1">{errors.file}</div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Allowed formats: JSON, Excel (.xlsx, .xls), CSV
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Document'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

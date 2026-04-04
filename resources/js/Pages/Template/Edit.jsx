import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TemplatesEdit({ template, orientations }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        orientation: template.orientation,
        name: template.name,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('template.update', template.id), {
            preserveScroll: true
        });
    };

    const fileUrl = template.file.path
        ? `/storage/${template.file.path}`
        : null;

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Template</h2>}
        >
            <Head title="Edit Template" />

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

                                {/* Orientation Dropdown */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Orientation
                                    </label>
                                    <select
                                        value={data.orientation}
                                        onChange={(e) => setData('orientation', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        {orientations.map((orientation) => (
                                            <option key={orientation} value={orientation} selected={orientation === 'vertical'}>
                                                {orientation}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.orientation && (
                                        <div className="text-red-600 text-sm mt-1">{errors.orientation}</div>
                                    )}
                                </div>

                                {/* PDF Viewer */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Template PDF Preview
                                    </label>
                                    {fileUrl ? (
                                        <div className="border rounded-md overflow-hidden">
                                            <embed
                                                src={fileUrl}
                                                type="application/pdf"
                                                width="100%"
                                                height="500px"
                                                className="w-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 border rounded-md p-4 text-center text-gray-500">
                                            No PDF file available.
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => location.href = route('template.index')}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Template'}
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

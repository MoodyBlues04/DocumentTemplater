import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TemplatesCreate({ orientations }) {
    const DEFAULT_ORIENTATION = 'vertical';

    const { data, setData, post, processing, errors, reset } = useForm({
        orientation: DEFAULT_ORIENTATION,
        name: '',
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('template.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name', 'file'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Template</h2>}
        >
            <Head title="Create Template" />

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
                                            <option key={orientation} value={orientation} selected={orientation === DEFAULT_ORIENTATION}>
                                                {orientation}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.orientation && (
                                        <div className="text-red-600 text-sm mt-1">{errors.orientation}</div>
                                    )}
                                </div>

                                {/* File Field */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Template file
                                    </label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
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
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Template'}
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

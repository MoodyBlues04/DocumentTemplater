import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';

export default function UsageGuide() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Usage Guide
                </h2>
            }
        >
            <Head title="Usage Guide"/>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-semibold">
                                Добро пожаловать!
                            </h3>
                            <p className="mt-2">
                                Это приложение позволяет автоматизировать рутинное заполнение документов
                            </p>

                            <h4 className="mt-4 font-semibold">Видео-демонстрация работы:</h4>
                            <div className="relative mx-auto w-full max-w-2xl overflow-hidden bg-black"
                                 style={{aspectRatio: '16/9'}}>
                                <iframe
                                    className="absolute inset-0 h-full w-full border-0"
                                    src="https://jumpshare.com/embed/tZit4s0aXzLIG8YuHRLC"
                                    title="Instructional video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            <h4 className="mt-4 font-semibold">Инструкция:</h4>
                            <ul className="mt-2 list-disc list-inside space-y-2">
                                <li>
                                    <strong>Вкладка Templates</strong>
                                    <p>Вкладка "Templates" содержит шаблоны ваших документов. Здесь вы можете загрузить
                                        шаблон в формате PDF и выбрать расположение и стили всех полей, которые сможете
                                        в нём заполнить. Можно выбрать цвет, шрифт и размер поля.</p>
                                </li>
                                <li>
                                    <strong>Заполнение шаблона</strong>
                                    <p>Задав поля для шаблона, вы можете его заполнить по кнопке "Fill". Заполнить
                                        шаблон можно либо из Excel, либо из JSON файла.</p>
                                    <p>Формат данных:</p>
                                    <ul className="ml-4 mt-1 list-disc list-inside space-y-1">
                                        <li>
                                            Excel файл должен в заголовках столбцов содержать имена всех полей шаблона
                                            (у него может быть много страниц, каждая должна содержать имена полей в
                                            заголовках, данные с каждой страницы будут собраны).
                                        </li>
                                        <li>
                                            JSON файл должен иметь формат:
                                            <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                                                <code>{`[
  {
    "field_1_name": "field_1_value",
    "field_2_name": "field_2_value",
    ...
  },
  {...},
  ...
]`}</code>
                                            </pre>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>После загрузки файла</strong> <p>данные из него будут занесены в ваш шаблон.
                                    Для каждой единицы данных (строки таблицы) будет создан отдельный файл PDF, все они
                                    будут запакованы в архив и доступны на странице "Documents".</p>
                                </li>
                                <li>
                                    <strong>Вкладка Documents</strong> <p>содержит все созданные вами документы.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

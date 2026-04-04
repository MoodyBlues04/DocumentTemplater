<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class TemplateUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->hasVerifiedEmail();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:1|max:100',

            'fields.*.id' => 'nullable|integer|' . Rule::exists('template_field', 'id'),
            'fields.*.is_deleted' => 'required|boolean',

            'fields.*.name' => 'required|string|min:1|max:100',
            'fields.*.font_size' => 'required|integer|min:1',
            'fields.*.font_name' => 'required|string', // todo enum
            'fields.*.font_color' => 'required|string', // todo enum
            'fields.*.height' => 'required|integer|min:1',
            'fields.*.width' => 'required|integer|min:1',
            'fields.*.x_coordinate' => 'required|integer|min:1',
            'fields.*.y_coordinate' => 'required|integer|min:1',
        ];
    }
}

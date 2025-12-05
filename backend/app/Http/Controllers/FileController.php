<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
            'attachable_type' => 'required|string',
            'attachable_id' => 'required|integer',
            'category' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $path = $file->store('uploads', 'public');

        $fileRecord = File::create([
            'attachable_type' => $request->attachable_type,
            'attachable_id' => $request->attachable_id,
            'file_path' => $path,
            'filename' => $file->getClientOriginalName(),
            'content_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'category' => $request->category,
        ]);

        return response()->json($fileRecord, 201);
    }

    public function show($id)
    {
        $file = File::findOrFail($id);

        // Check access based on attachable
        // TODO: Add proper access checks

        if (! Storage::disk('public')->exists($file->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($file->file_path, $file->filename);
    }
}

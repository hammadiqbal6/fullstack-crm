<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $contact = $user->contact;

        if (! $contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $files = $contact->files;

        return response()->json($files);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'category' => 'nullable|string|max:255',
        ]);

        $user = auth()->user();
        $contact = $user->contact;

        if (! $contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $file = $request->file('file');
        $path = $file->store('documents', 'public');

        $fileRecord = File::create([
            'attachable_type' => Contact::class,
            'attachable_id' => $contact->id,
            'file_path' => $path,
            'filename' => $file->getClientOriginalName(),
            'content_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'category' => $request->category,
        ]);

        return response()->json($fileRecord, 201);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $contact = $user->contact;

        if (! $contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $file = File::where('id', $id)
            ->where('attachable_type', Contact::class)
            ->where('attachable_id', $contact->id)
            ->firstOrFail();

        Storage::disk('public')->delete($file->file_path);
        $file->delete();

        return response()->json(['message' => 'File deleted successfully']);
    }
}

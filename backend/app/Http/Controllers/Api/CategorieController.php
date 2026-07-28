<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategorieRequest;
use App\Models\Category;

class CategorieController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Category::class);

        return Category::query()->orderBy('nom')->get();
    }

    public function store(StoreCategorieRequest $request)
    {
        $category = Category::create([
            'entreprise_id' => $request->user()->entreprise_id,
            'nom' => $request->validated('nom'),
        ]);

        return response()->json($category, 201);
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}

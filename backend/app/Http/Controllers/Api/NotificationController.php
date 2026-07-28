<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('utilisateur_id', $request->user()->id);

        if ($request->filled('lue')) {
            $query->where('lue', $request->boolean('lue'));
        }

        return $query->with(['obligation:id,intitule', 'entreprise:id,raison_sociale'])
            ->orderBy('lue', 'asc')
            ->orderBy('date_creation', 'desc')
            ->paginate(perPage: $request->get('per_page', 20));
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('utilisateur_id', auth()->id())
            ->findOrFail($id);
        $notification->update(['lue' => true]);
        return response()->json($notification);
    }

    public function markAllRead()
    {
        Notification::where('utilisateur_id', auth()->user()->id)
            ->where('lue', false)
            ->update(['lue' => true]);
        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }

    public function unreadCount()
    {
        $count = Notification::where('utilisateur_id', auth()->user()->id)
            ->where('lue', false)
            ->count();
        return response()->json(['unread_count' => $count]);
    }
}

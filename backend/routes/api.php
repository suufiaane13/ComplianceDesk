<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EntrepriseController;
use App\Http\Controllers\Api\ObligationController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\PasswordController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login')
    ->withoutMiddleware('auth:sanctum');

Route::post('/password/set', [PasswordController::class, 'set'])
    ->middleware('throttle:login')
    ->withoutMiddleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'entreprise_active'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/entreprises', [EntrepriseController::class, 'index']);
    Route::post('/entreprises', [EntrepriseController::class, 'store'])->middleware('super_admin');
    Route::get('/entreprises/{entreprise}', [EntrepriseController::class, 'show']);
    Route::put('/entreprises/{entreprise}', [EntrepriseController::class, 'update']);
    Route::patch('/entreprises/{entreprise}/statut', [EntrepriseController::class, 'updateStatut'])->middleware('super_admin');
    Route::post('/entreprises/{entreprise}/admins', [EntrepriseController::class, 'addAdmin'])->middleware('super_admin');
    Route::get('/entreprises/{entreprise}/users', [EntrepriseController::class, 'users']);
    Route::post('/entreprises/{entreprise}/users', [EntrepriseController::class, 'addUser']);
    Route::put('/entreprises/{entreprise}/users/{user}', [EntrepriseController::class, 'updateUser']);
    Route::delete('/entreprises/{entreprise}/users/{user}', [EntrepriseController::class, 'destroyUser']);

    Route::get('/admin/dashboard', [DashboardController::class, 'platform'])->middleware('super_admin');

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

    Route::middleware('tenant_member')->group(function () {
        Route::get('/obligations', [ObligationController::class, 'index']);
        Route::post('/obligations', [ObligationController::class, 'store'])->middleware('tenant_admin');

        Route::prefix('obligations/{obligation}')->group(function () {
            Route::get('/', [ObligationController::class, 'show']);
            Route::put('/', [ObligationController::class, 'update'])->middleware('tenant_admin');
            Route::delete('/', [ObligationController::class, 'destroy'])->middleware('tenant_admin');
            Route::get('/documents', [DocumentController::class, 'index']);
            Route::post('/documents', [DocumentController::class, 'store']);
        });

        Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
        Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->middleware('tenant_admin');

        Route::get('/users', [UserController::class, 'index'])->middleware('tenant_admin');
        Route::post('/users', [UserController::class, 'store'])->middleware('tenant_admin');
        Route::put('/users/{user}', [UserController::class, 'update'])->middleware('tenant_admin');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('tenant_admin');

        Route::get('/categories', [CategorieController::class, 'index']);
        Route::post('/categories', [CategorieController::class, 'store'])->middleware('tenant_admin');
        Route::delete('/categories/{category}', [CategorieController::class, 'destroy'])->middleware('tenant_admin');

        Route::get('/dashboard', [DashboardController::class, 'index']);
    });
});

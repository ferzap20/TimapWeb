<?php
require_once __DIR__ . '/vendor/autoload.php';

// Load .env file if it exists
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            putenv(trim($line));
        }
    }
}

function getDatabase(): MongoDB\Database {
    $uri = getenv('MONGODB_URI');
    if (!$uri) {
        throw new RuntimeException('MONGODB_URI environment variable is not set');
    }
    $client = new MongoDB\Client($uri);
    return $client->timap;
}

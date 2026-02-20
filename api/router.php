<?php
/**
 * Router for PHP built-in dev server.
 * Usage: php -S localhost:8080 router.php
 */
if (php_sapi_name() === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    // Serve static files if they exist
    if ($path !== '/' && file_exists(__DIR__ . $path)) {
        return false;
    }
}
// Route everything else to index.php
require __DIR__ . '/index.php';

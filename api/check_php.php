<?php
echo "<h2>PHP Info for TimapWeb</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";

// Check MongoDB extension
if (extension_loaded('mongodb')) {
    echo "<p style='color:green'><strong>MongoDB extension:</strong> INSTALLED (v" . phpversion('mongodb') . ")</p>";
} else {
    echo "<p style='color:red'><strong>MongoDB extension:</strong> NOT INSTALLED</p>";
    echo "<p>You need to install it. Ask your OVH hosting panel or run: <code>pecl install mongodb</code></p>";
}

// Check if composer vendor exists
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "<p style='color:green'><strong>Composer vendor:</strong> OK</p>";
} else {
    echo "<p style='color:red'><strong>Composer vendor:</strong> MISSING - upload the vendor/ folder</p>";
}

// Test MongoDB connection
if (extension_loaded('mongodb') && file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/config.php';
    try {
        $db = getDatabase();
        $db->command(['ping' => 1]);
        echo "<p style='color:green'><strong>MongoDB connection:</strong> OK</p>";
    } catch (Exception $e) {
        echo "<p style='color:red'><strong>MongoDB connection:</strong> FAILED - " . $e->getMessage() . "</p>";
    }
}

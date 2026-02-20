<?php
/**
 * One-time setup script to create MongoDB indexes.
 * Run with: php setup_indexes.php
 */
require_once __DIR__ . '/config.php';

$db = getDatabase();

echo "Creating indexes...\n";

// Matches indexes
$db->matches->createIndex(['invite_code' => 1], ['unique' => true]);
echo "  - matches.invite_code (unique)\n";

$db->matches->createIndex(['date' => 1]);
echo "  - matches.date\n";

// Participants indexes
$db->participants->createIndex(['match_id' => 1]);
echo "  - participants.match_id\n";

$db->participants->createIndex(
    ['match_id' => 1, 'user_id' => 1],
    ['unique' => true]
);
echo "  - participants.(match_id, user_id) (unique)\n";

echo "\nDone! All indexes created successfully.\n";

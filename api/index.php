<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/matches.php';
require_once __DIR__ . '/participants.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/api#', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];

// Route dispatch — order matters (more specific routes first)
if (preg_match('#^/matches/([a-f0-9]{24})/join$#', $uri, $m) && $method === 'POST') {
    handleJoinMatch($m[1]);
} elseif (preg_match('#^/matches/([a-f0-9]{24})/leave$#', $uri, $m) && $method === 'POST') {
    handleLeaveMatch($m[1]);
} elseif (preg_match('#^/matches/([a-f0-9]{24})/joined$#', $uri, $m) && $method === 'GET') {
    handleHasJoined($m[1]);
} elseif (preg_match('#^/matches/invite/([a-z0-9]{8})$#i', $uri, $m) && $method === 'GET') {
    handleGetMatchByInvite($m[1]);
} elseif (preg_match('#^/matches/([a-f0-9]{24})$#', $uri, $m) && $method === 'GET') {
    handleGetMatch($m[1]);
} elseif (preg_match('#^/matches/([a-f0-9]{24})$#', $uri, $m) && $method === 'PUT') {
    handleUpdateMatch($m[1]);
} elseif (preg_match('#^/matches/([a-f0-9]{24})$#', $uri, $m) && $method === 'DELETE') {
    handleDeleteMatch($m[1]);
} elseif ($uri === '/matches' && $method === 'GET') {
    handleGetMatches();
} elseif ($uri === '/matches' && $method === 'POST') {
    handleCreateMatch();
} elseif ($uri === '/stats' && $method === 'GET') {
    handleGetStats();
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}

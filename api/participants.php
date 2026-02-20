<?php
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

function handleJoinMatch(string $matchId): void {
    $db = getDatabase();
    $body = getJsonBody();

    try {
        $objectId = new ObjectId($matchId);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid match ID']);
        return;
    }

    if (empty($body['user_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing user_id']);
        return;
    }

    // Check match exists
    $match = $db->matches->findOne(['_id' => $objectId]);
    if (!$match) {
        http_response_code(404);
        echo json_encode(['error' => 'Match not found']);
        return;
    }

    // Check if already joined
    $existing = $db->participants->findOne([
        'match_id' => $objectId,
        'user_id' => $body['user_id'],
    ]);
    if ($existing) {
        http_response_code(409);
        echo json_encode(['error' => 'Already joined this match']);
        return;
    }

    // Get current count for position
    $count = $db->participants->countDocuments(['match_id' => $objectId]);

    $participant = [
        'match_id' => $objectId,
        'user_id' => $body['user_id'],
        'user_name' => $body['user_name'] ?? '',
        'position' => $count,
        'is_starter' => true,
        'joined_at' => new UTCDateTime(),
    ];

    $result = $db->participants->insertOne($participant);
    $participant['_id'] = $result->getInsertedId();

    http_response_code(201);
    echo json_encode(formatParticipant($participant));
}

function handleLeaveMatch(string $matchId): void {
    $db = getDatabase();
    $body = getJsonBody();

    try {
        $objectId = new ObjectId($matchId);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid match ID']);
        return;
    }

    if (empty($body['user_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing user_id']);
        return;
    }

    $db->participants->deleteOne([
        'match_id' => $objectId,
        'user_id' => $body['user_id'],
    ]);

    echo json_encode(['success' => true]);
}

function handleHasJoined(string $matchId): void {
    $db = getDatabase();
    $userId = $_GET['userId'] ?? '';

    if (empty($userId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing userId query parameter']);
        return;
    }

    try {
        $objectId = new ObjectId($matchId);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid match ID']);
        return;
    }

    $exists = $db->participants->findOne([
        'match_id' => $objectId,
        'user_id' => $userId,
    ]);

    echo json_encode(['joined' => $exists !== null]);
}

function handleGetStats(): void {
    $db = getDatabase();
    $today = date('Y-m-d');

    $activeMatches = $db->matches->countDocuments(['date' => ['$gte' => $today]]);

    // Count participants in active matches
    $pipeline = [
        ['$match' => ['date' => ['$gte' => $today]]],
        ['$lookup' => [
            'from' => 'participants',
            'localField' => '_id',
            'foreignField' => 'match_id',
            'as' => 'participants_list',
        ]],
        ['$group' => [
            '_id' => null,
            'total' => ['$sum' => ['$size' => '$participants_list']],
        ]],
    ];

    $result = $db->matches->aggregate($pipeline)->toArray();
    $onlinePlayers = !empty($result) ? $result[0]['total'] : 0;

    echo json_encode([
        'activeMatches' => $activeMatches,
        'onlinePlayers' => $onlinePlayers,
    ]);
}

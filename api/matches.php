<?php
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

function generateInviteCode(): string {
    $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    $code = '';
    for ($i = 0; $i < 8; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

function formatMatch($doc): array {
    $arr = is_array($doc) ? $doc : (array) $doc;
    $arr['id'] = (string) $arr['_id'];
    unset($arr['_id']);
    if (isset($arr['created_at']) && $arr['created_at'] instanceof UTCDateTime) {
        $arr['created_at'] = $arr['created_at']->toDateTime()->format('c');
    }
    if (isset($arr['updated_at']) && $arr['updated_at'] instanceof UTCDateTime) {
        $arr['updated_at'] = $arr['updated_at']->toDateTime()->format('c');
    }
    return $arr;
}

function formatParticipant($doc): array {
    $arr = is_array($doc) ? $doc : (array) $doc;
    $arr['id'] = (string) $arr['_id'];
    unset($arr['_id']);
    if (isset($arr['match_id']) && $arr['match_id'] instanceof ObjectId) {
        $arr['match_id'] = (string) $arr['match_id'];
    }
    if (isset($arr['joined_at']) && $arr['joined_at'] instanceof UTCDateTime) {
        $arr['joined_at'] = $arr['joined_at']->toDateTime()->format('c');
    }
    return $arr;
}

function getJsonBody(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function handleCreateMatch(): void {
    $db = getDatabase();
    $body = getJsonBody();

    $required = ['title', 'sport', 'location', 'date', 'time', 'creator_id', 'creator_name'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            return;
        }
    }

    $now = new UTCDateTime();
    $inviteCode = generateInviteCode();

    $match = [
        'title' => $body['title'],
        'sport' => $body['sport'],
        'location' => $body['location'],
        'date' => $body['date'],
        'time' => $body['time'],
        'max_players' => (int) ($body['max_players'] ?? 10),
        'creator_id' => $body['creator_id'],
        'creator_name' => $body['creator_name'],
        'captain_name' => $body['captain_name'] ?? '',
        'price_per_person' => (int) ($body['price_per_person'] ?? 0),
        'invite_code' => $inviteCode,
        'created_at' => $now,
        'updated_at' => $now,
    ];

    $result = $db->matches->insertOne($match);
    $match['_id'] = $result->getInsertedId();

    // Auto-add creator as first participant
    $captainName = !empty($body['captain_name']) ? $body['captain_name'] : $body['creator_name'];
    $db->participants->insertOne([
        'match_id' => $result->getInsertedId(),
        'user_id' => $body['creator_id'],
        'user_name' => $captainName,
        'position' => 0,
        'is_starter' => true,
        'joined_at' => $now,
    ]);

    http_response_code(201);
    echo json_encode(formatMatch($match));
}

function handleGetMatches(): void {
    $db = getDatabase();
    $today = date('Y-m-d');

    $pipeline = [
        ['$match' => ['date' => ['$gte' => $today]]],
        ['$sort' => ['date' => 1, 'time' => 1]],
        ['$lookup' => [
            'from' => 'participants',
            'localField' => '_id',
            'foreignField' => 'match_id',
            'as' => 'participants_list',
        ]],
        ['$addFields' => ['participant_count' => ['$size' => '$participants_list']]],
        ['$project' => ['participants_list' => 0]],
    ];

    $matches = $db->matches->aggregate($pipeline)->toArray();
    $result = array_map('formatMatch', $matches);

    echo json_encode($result);
}

function handleGetMatch(string $id): void {
    $db = getDatabase();

    try {
        $objectId = new ObjectId($id);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid match ID']);
        return;
    }

    $match = $db->matches->findOne(['_id' => $objectId]);
    if (!$match) {
        http_response_code(404);
        echo json_encode(['error' => 'Match not found']);
        return;
    }

    $participants = $db->participants->find(
        ['match_id' => $objectId],
        ['sort' => ['position' => 1]]
    )->toArray();

    $result = formatMatch($match);
    $result['participants'] = array_map('formatParticipant', $participants);
    $result['participant_count'] = count($participants);

    echo json_encode($result);
}

function handleGetMatchByInvite(string $code): void {
    $db = getDatabase();

    $match = $db->matches->findOne(['invite_code' => strtolower($code)]);
    if (!$match) {
        http_response_code(404);
        echo json_encode(['error' => 'Match not found']);
        return;
    }

    $participants = $db->participants->find(
        ['match_id' => $match->_id],
        ['sort' => ['position' => 1]]
    )->toArray();

    $result = formatMatch($match);
    $result['participants'] = array_map('formatParticipant', $participants);
    $result['participant_count'] = count($participants);

    echo json_encode($result);
}

function handleUpdateMatch(string $id): void {
    $db = getDatabase();
    $body = getJsonBody();

    try {
        $objectId = new ObjectId($id);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid match ID']);
        return;
    }

    // Validate creator ownership
    $match = $db->matches->findOne(['_id' => $objectId]);
    if (!$match) {
        http_response_code(404);
        echo json_encode(['error' => 'Match not found']);
        return;
    }
    if (empty($body['creator_id']) || $match->creator_id !== $body['creator_id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Only the creator can update this match']);
        return;
    }

    // Only allow updating these fields
    $allowed = ['title', 'sport', 'location', 'date', 'time', 'max_players', 'captain_name', 'price_per_person'];
    $updates = [];
    foreach ($allowed as $field) {
        if (array_key_exists($field, $body)) {
            $updates[$field] = $body[$field];
        }
    }

    if (!empty($updates)) {
        $updates['updated_at'] = new UTCDateTime();
        $db->matches->updateOne(['_id' => $objectId], ['$set' => $updates]);
    }

    $updated = $db->matches->findOne(['_id' => $objectId]);
    echo json_encode(formatMatch($updated));
}

function handleDeleteMatch(string $id): void {
    $db = getDatabase();
    $body = getJsonBody();

    try {
        $objectId = new ObjectId($id);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid match ID']);
        return;
    }

    // Validate creator ownership
    $match = $db->matches->findOne(['_id' => $objectId]);
    if (!$match) {
        http_response_code(404);
        echo json_encode(['error' => 'Match not found']);
        return;
    }
    if (empty($body['creator_id']) || $match->creator_id !== $body['creator_id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Only the creator can delete this match']);
        return;
    }

    // Cascade delete participants
    $db->participants->deleteMany(['match_id' => $objectId]);
    $db->matches->deleteOne(['_id' => $objectId]);

    echo json_encode(['success' => true]);
}

<?php
require __DIR__ . '/cors.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($input['username'] ?? '');
$password = (string)($input['password'] ?? '');

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['Error: Please enter username and password']);
    exit;
}

//temp user till database
$mockUsername = 'testuser';
$mockPassword = 'password';

if ($username === $mockUsername && $password === $mockPassword) {
    echo json_encode([
        "id" => 1,
        "firstName" => "Test",
        "lastName" => "User"
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Incorrect username or password"]);
}
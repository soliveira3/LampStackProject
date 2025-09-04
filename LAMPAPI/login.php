<?php
require __DIR__ . '/cors.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($input['email'] ?? '');
$password = (string)($input['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['Error: Please enter email and password']);
    exit;
}

//temp user till database
$mockEmail = 'test@example.com';
$mockPassword = 'password';

if ($email === $mockEmail && $password === $mockPassword) {
    echo json_encode(["message" => 'Login Succesful' ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Incorrect email or password"]);
}
<?php

require_once __DIR__ . '/vendor/autoload.php';

// Chargement des variables d'environnement
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../config');
$dotenv->load();
$api_key = $_ENV['API_KEY'];

$stripe = new \Stripe\StripeClient($api_key);

function calculateOrderAmount(int $amount): int {
    $amount = htmlspecialchars($amount);
    // On s'assure d'un montant minimum de 1€ (100 centimes)
    $amount = max(1, (float)$amount);
    return (int)($amount * 100);
}

header('Content-Type: application/json');

try {
    // retrieve JSON from POST body
    $jsonStr = file_get_contents('php://input');
    $jsonObj = json_decode($jsonStr);
    

    $paymentIntent = $stripe->paymentIntents->create([
        'amount' => calculateOrderAmount($jsonObj->amount),
        'currency' => 'eur',
        'automatic_payment_methods' => ['enabled' => true],
    ]);

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

var_dump($jsonObj);
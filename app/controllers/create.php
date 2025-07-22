<?php

require_once __DIR__ . '/vendor/autoload.php';

// Chargement des variables d'environnement
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../config');
$dotenv->load();
$api_key = $_ENV['API_KEY'];

$stripe = new \Stripe\StripeClient($api_key);

function calculateOrderAmount($amount): int {
    // Sécurité : validation stricte de l'entrée (entier positif uniquement)
    if (!is_numeric($amount) || !is_int(0 + $amount) || $amount < 1) {
        throw new InvalidArgumentException('Montant invalide.');
    }
    return (int)$amount * 100;
}

header('Content-Type: application/json');

try {
    // retrieve JSON from POST body
    $jsonStr = file_get_contents('php://input');
    $jsonObj = json_decode($jsonStr);

    // TODO : Create a PaymentIntent with amount and currency in '$paymentIntent'

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}


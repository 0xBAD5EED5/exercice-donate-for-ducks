/* global Stripe */
/* global stripe */
/* global fetch */
/* global URLSearchParams */

const stripe = Stripe('pk_test_51Rnaz5RZDnyRj9pxOlIy09k8ak3fcM0YMx5Xbn3qwhx0kAopaIYm6ySv5bYxIEK7KdHskMStWsnEyWUN73Ii0mMr00mxIPULX5');

let amount;
const amountInput = document.getElementById('montant-personnalise');
amountInput.addEventListener('input', function() {
	amount = parseFloat(this.value) || 0;
	console.log("Nouveau montant :", amount);
	if (amount >= 1) {
		initialize();
	}
});

let elements;

checkStatus();

document
	.querySelector("#payment-form")
	.addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {
	const { clientSecret } = await fetch("../app/controllers/create.php", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ amount }),
	}).then((r) => r.json());

	elements = stripe.elements({ clientSecret });

	const paymentElementOptions = {
		layout: "tabs",
	};

	const paymentElement = elements.create("payment", paymentElementOptions);
	paymentElement.mount("#payment-element");

	const buttonSubmit = document.querySelector('form#payment-form button#submit');
	buttonSubmit.disabled = false;
	buttonSubmit.querySelector("#button-text").textContent = "Don de " + amount + "€";
}

async function handleSubmit(e) {
	e.preventDefault();
	setLoading(true);

	const { error } = await stripe.confirmPayment({
		elements,
		confirmParams: {
			return_url: "https://saidtalbi.sites.3wa.io/exercice-donate-for-ducks/public/index.php",
		},
	});

	// This point will only be reached if there is an immediate error when
	// confirming the payment. Otherwise, your customer will be redirected to
	// your `return_url`. For some payment methods like iDEAL, your customer will
	// be redirected to an intermediate site first to authorize the payment, then
	// redirected to the `return_url`.
	if (error.type === "card_error" || error.type === "validation_error") {
		showMessage(error.message);
	}
	else {
		showMessage("An unexpected error occurred.");
	}

	setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
	const clientSecret = new URLSearchParams(window.location.search).get(
		"payment_intent_client_secret"
	);

	if (!clientSecret) {
		return;
	}

	const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

	switch (paymentIntent.status) {
		case "succeeded":
			showMessage("Payment succeeded!");
			break;
		case "processing":
			showMessage("Your payment is processing.");
			break;
		case "requires_payment_method":
			showMessage("Your payment was not successful, please try again.");
			break;
		default:
			showMessage("Something went wrong.");
			break;
	}
}

// ------- UI helpers -------

function showMessage(messageText) {
	const messageContainer = document.querySelector("#payment-message");

	messageContainer.classList.remove("hidden");
	messageContainer.textContent = messageText;

	setTimeout(function() {
		messageContainer.classList.add("hidden");
		messageContainer.textContent = "";
	}, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
	if (isLoading) {
		// Disable the button and show a spinner
		document.querySelector("#submit").disabled = true;
		document.querySelector("#spinner").classList.remove("hidden");
		document.querySelector("#button-text").classList.add("hidden");
	}
	else {
		document.querySelector("#submit").disabled = false;
		document.querySelector("#spinner").classList.add("hidden");
		document.querySelector("#button-text").classList.remove("hidden");
	}
}

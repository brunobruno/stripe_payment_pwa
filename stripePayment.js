import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import store from '@magento/venia-concept/src/store';
import { useHistory  } from 'react-router-dom';

import {
	setPaymentMethodGeneric,
	setBillingAddressGeneric,
	payTimeGeneric,
	placeOrderGeneric
 } from './utils'

const stripePromise = loadStripe('pk_test_add_your_pubic_key_here');

const StripePayment = () => {

	const customerCartId = useState(store.getState().cart.cartId)
	const paymentMethodName = 'mpstripe'

    useEffect(() => {
		setPaymentMethodGeneric(paymentMethod,cartId);
    }, []);

	const CheckoutForm = () => {

		const stripe = useStripe();
		const elements = useElements();
		const userDetails = store.getState().user.currentUser
		const history = useHistory();

		const handleSubmit = async (event) => {

			event.preventDefault();
			if (elements == null) {
				return;
			}
			const {error, paymentMethod} = await stripe.createPaymentMethod({
				type: 'card',
				card: elements.getElement(CardElement),
			});

			if(!error && paymentMethod.id){	

				const setPaymentMethod = await setPaymentMethodGeneric(paymentMethodName,customerCartId)
				const setPaymentMethodResponse = await setPaymentMethod.json()

				//handle errors
				if(setPaymentMethodResponse.errors){
					console.log(setPaymentMethodResponse.errors)
				}

				await setBillingAddressGeneric(customerCartId)

				const placeOrder = await placeOrderGeneric(customerCartId);
				const placeOrdeResponse = await placeOrder.json();

				const timeToPay = await payTimeGeneric(placeOrdeResponse.order_number);
				const timeToPayResponse = await timeToPay.json();

				try {

					const {paymentIntent, error} = await stripe.confirmCardPayment(
						timeToPayResponse.data.paymentIntent.payment_intent.client_secret,
						{
						payment_method: {
							card: elements.getElement(CardElement),
							billing_details: {
								name: `${userDetails.firstname} ${userDetails.lastname}`,
								email: userDetails.email,
								},
							},
						},
					);

					//declined cards etc...
					if(error){}

					if(paymentIntent.status === "succeeded"){

						//example on calling a /success route that receive the order number
						history.push({
							pathname : '/success',
							state: {
								userName: userDetails.firstname,
								order: placeOrdeResponse.order_number
							}
						});
					}

				} catch (tryError) {
					console.log('paymentError',tryError)
				}

		};
	}

	return <>
				<CardElement/>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!stripe || !elements}>
					</button>
			</>;
	};

	return <>
		<Elements stripe={stripePromise}>
			<CheckoutForm />
		</Elements>
	</>
}

export default StripePayment;

//generic functions like this are a good practice since pwa studio can support multiple payment methods

const apiUrl = `${window.location.origin}/graphql`
const authHeaders = () => {
	const localToken = JSON.parse( localStorage.getItem("M2_VENIA_BROWSER_PERSISTENCE__signin_token"));
	return {
		"Content-Type": "application/json",
		"Authorization" : `Bearer ${localToken.value.slice(1, -1)}`
	}

}

const setPaymentMethodGeneric = (paymentMethod,cartId) => {
	return fetch(apiUrl, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify({
			query: `mutation {
				setPaymentMethodOnCart(input: {
					cart_id: "${cartId}"
					payment_method: {
						code: "${paymentMethod}"
					}
				}) {
					cart {
					selected_payment_method {
						code
						title
						}
					}
				}
			}`
		})
	})
}

const placeOrderGeneric = async (cartId) => {
	const placeOrder = await fetch(apiUrl, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify({
			query: `mutation {
				placeOrder(
				  input: {
					cart_id: "${cartId}"
				  }
				) {
				  order {
					order_number
				  }
				}
			  }`
		})
	})
	return await placeOrder.json();
	
} 

const setBillingAddressGeneric = cartId => {
	//billing address is always the same as shipping those billing address data are ignored
	return fetch(apiUrl, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify({
			query: `mutation {
				setBillingAddressOnCart(
					input: {
					cart_id: "${cartId}"
					billing_address: {
						address: {
						firstname: "Bob"
						lastname: "Roll"
						company: "Magento"
						street: ["Magento Pkwy", "Main Street"]
						city: "Austin"
						region: "TX"
						postcode: "78758"
						country_code: "US"
						telephone: "8675309"
						save_in_address_book: true
						}
						same_as_shipping: true
					}
					}
				) {
					cart {
					billing_address {
						firstname
						lastname
						company
						street
						city
						region{
						code
						label
						}
						postcode
						telephone
						country{
						code
						label
						}
					}
					}
				}
			}`
		})
	})
}

// need to create on magento side a graphql like this that have access to the secret stripe key
const payTimeGeneric = (paymentMethod, orderid) => {
		return fetch(apiUrl, {
			method: 'POST',
			headers: authHeaders(),
			body: JSON.stringify({
				query: `mutation{
					paymentIntent(
						paymentMethod : "${paymentMethod}"
						canSaveCard : false
						orderId: "${orderid}"
						){
							success
							message
							payment_intent{
								client_secret
								payment_id
								amount
								payment_url
							}
						}
				}`
			})
		})

}

export {
		setPaymentMethodGeneric,
		setBillingAddressGeneric,
		payTimeGeneric,
		placeOrderGeneric,
	}

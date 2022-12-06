
function localIntercept(targets) {

    //stripe payment component
    targets.of('@magento/venia-ui').checkoutPagePaymentTypes.tap((checkoutPagePaymentTypes) => {
        checkoutPagePaymentTypes.add({
          paymentCode: 'mpstripe',
          importPath: require.resolve('./src/components/PaymentMethods/StripePayment/stripePayment.js')
        });
    });

}

module.exports = localIntercept;
$(document).ready(() => {
    $('.add-form').hide();
    $('.payment-options').hide();

    $('.description').hide();
    $('.know-less').hide();
    $('.know-more').on('click', () => {
        $('.description').show();
        $('.know-more').hide();
        $('.know-less').show();
    });
    $('.know-less').on('click', () => {
        $('.description').hide();
        $('.know-more').show();
        $('.know-less').hide();
    })


    //add new Address form display
    const addAddress = document.getElementById('addAddress');
    if (addAddress) {
        addAddress.addEventListener('click', (e) => {
            e.preventDefault();
            $('.add-form').slideDown();

        })
    }
    //go up address
    const upButton = document.getElementById('upButton');
    if (upButton) {
        upButton.addEventListener('click', (e) => {
            e.preventDefault();
            $('.add-form').slideUp();
        })
    }

    const proceedPayment = document.getElementById('proceedPayment');
    if (proceedPayment) {
        proceedPayment.addEventListener('click', (e) => {
            e.preventDefault;
            $('#proceedPayment').hide();
            $('.payment-options').slideDown();
        })
    }

    //create order
    const submitOrder = document.getElementById('submitOrder');
    if (submitOrder) {
        submitOrder.addEventListener('click', async (e) => {
            e.preventDefault();
            let form = document.getElementById('orderForm');
            if (form) {
                let formData = new FormData(form);
                const body = Object.fromEntries(formData);
                console.log(body)
                await fetch('/cart/place-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.assign('/cart/order-success')
                        }
                        if (data.status) {
                            showRazorpay(data.order, data.user);
                        }
                    })

            } else {
                console.error('Form element not found');
            }
        });
    }

    //payment interface function 
    showRazorpay = (order, user) => {
        var options = {
            "key": "rzp_test_I43lYVXIyrWCQF", // Enter the Key ID generated from the Dashboard
            "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "Times Cart",
            "description": "Test Transaction",
            "image": "https://drive.google.com/uc?id=18EJgrQQfFCgLUCtUCOY-6tujL8KFX0qI",
            "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": function (response) {
                verifyPayment(response)
            },
            "prefill": {
                "name": user.user_name,
                "email": user.user_email,
                "contact": user.user_mobile
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#2ade99"
            }
        };

        var rzp1 = new Razorpay(options);
        rzp1.open();
        rzp1.on('payment.failed', function (response) {
            swal.fire("Failed!", response.error.description, "error")
                .then(() => {
                    location.assign('/')
                })
        });
    },

        verifyPayment = async (response) => {
            await fetch('/cart/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response)
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.assign('/cart/order-success')
                    }
                })
        }

    $('.coupenss').hide();
    $('#checkCoupen').on('click', () => {

        $('.coupenss').show();
        $('#proceedPayment').hide();
        $('#submitOrder').hide();

    });
    $('#back').on('click', () => {
        $('.coupenss').hide();
        $('#proceedPayment').show();
        $('#submitOrder').show();
    });



    // apply coupen 
    applayCoupen = async (id) => {
        // /cart/checkout
        let total = document.getElementById('price').value;
        await fetch(`/cart/checkout?coupen=${id}&total=${total}`)
            .then((response) => response.json())
            .then(data => {
                if (data.success) {
                    const newTotalAmount = data.total;
                    const productsElement = document.querySelector('.list-group-item:nth-child(1) span');
                    const shippingElement = document.querySelector('.list-group-item:nth-child(2) span');
                    const Showdiscount = document.getElementById('showDiscount')
                    const totalAmountElement = document.querySelector('.list-group-item:nth-child(4) span strong');
                    let price = document.getElementById('price');
                    price.value = newTotalAmount
                    let coupen = document.getElementById('coupen');
                    coupen.value = id;
                    let discount = document.getElementById('discount');
                    discount.value = data.discount
                    let coupen_code = document.getElementById('coupen_code');
                    coupen_code.value = data.coupen_code
                    productsElement.textContent = `₹${newTotalAmount}`;
                    shippingElement.textContent = '₹ 0';
                    totalAmountElement.textContent = `₹${newTotalAmount}`;
                    Showdiscount.textContent = `${data.discount}%`
                    console.log(Showdiscount);
                    $('.coupenss').hide();
                    $('#proceedPayment').show();
                    $('#submitOrder').show();
                } else {
                    Swal.fire(
                        'Oops',
                        `You need a minimum purchase of ₹${data.min_amount} to apply this coupon.`,
                        'Err'
                    );
                }
            })
    }
})
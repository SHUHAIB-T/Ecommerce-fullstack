$(document).ready(() => {
    addToCart = async (productID) => {
        await fetch(`/cart/add-to-cart/${productID}`, {
            method: 'GET'
        }).then(response => response.json())
            .then(data => {
                if (data.status) {
                    let cartCount = document.getElementById('cartCount');
                    if (cartCount) {
                        cartCount.innerText = data.count
                    }
                } else {
                    location.assign('/cart')
                }
            })
    },
        removeFromCart = async (product_ID) => {
            Swal.fire({
                title: 'Are you sure?',
                text: `Are you sure want to remove this product from cart`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Remove it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await fetch(`/cart/remove-from-cart/${product_ID}`, {
                        method: 'GET'
                    }).then(response => response.json())
                        .then(data => {
                            if (data.status) {
                                location.assign('/cart');
                            }
                        })
                }
            })
        }

    // Increase quantity
    increaseCartQuantity = async (productID) => {

        try {
            const response = await fetch(`/cart/add-quantity/${productID}`, {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const quantityInput = document.querySelector(`#quantityInput-${productID}`);
                    const currentQuantity = parseInt(quantityInput.value);
                    quantityInput.value = currentQuantity + 1;
                    location.assign('/cart');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Limited Stock!',
                        text: 'The item you selected has only a limited quantity available.'
                    })
                }
            } else {
                // Handle fetch errors here
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Decrease quantity
    decreaseCartQuantity = async (productId) => {

        try {
            const quantityInput = document.querySelector(`#quantityInput-${productId}`);
            const currentQuantity = parseInt(quantityInput.value);

            if (currentQuantity <= 1) {
                return;
            }

            const response = await fetch(`/cart/minus-quantity/${productId}`, {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    quantityInput.value = currentQuantity - 1;
                    location.assign('/cart');
                }
            } else {
                // Handle fetch errors here
            }
        } catch (error) {
            console.error(error);
        }
    }
})
$(document).ready(() => {
    $('.track-order').hide();
    trckOrder = (id) => {
        $(`#order${id}`).slideToggle();
    }



    cancelOrder = (product_id, order_id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "are you sure want to cancel this Order",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0061bc",
            cancelButtonColor: "rgb(128, 128, 128)",
            confirmButtonText: "Yes Cancel it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await fetch(`/orders/cancel_order/${product_id}/${order_id}`, {
                    method: 'GET',
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Cancelled!',
                                'Product cancelled successfully',
                                'success'
                            ).then(() => {
                                location.assign('/orders');
                            })
                        } else {
                            Swal.fire({
                                title: "Warning",
                                text: "This item has one offer applied, which will result in canceling all the items in this order.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#0061bc",
                                cancelButtonColor: "rgb(128, 128, 128)",
                                confirmButtonText: "Yes Cancel it!",
                            }).then(async (result) => {
                                if (result.isConfirmed) {
                                    await fetch(`/orders/cancel_all_order/${order_id}`)
                                        .then((response) => response.json())
                                        .then(data => {
                                            if (data.success) {
                                                Swal.fire(
                                                    'Cancelled!',
                                                    'Product cancelled successfully',
                                                    'success'
                                                ).then(() => {
                                                    location.assign('/orders');
                                                })
                                            }
                                        })
                                }
                            })
                        }
                    })

            }
        });
    }


    // return order 
    $("#return_form").validate({
        rules: {
            reason: {
                required: true
            },
            comment: {
                required: true
            }
        },
        submitHandler: async (form) => {
            let order_id = document.getElementById('order_id').value;
            let fomrdata = new FormData(form);
            let payload = Object.fromEntries(fomrdata);
            await fetch('/orders/order-return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.assign(`/orders/order-details/${order_id}`)
                    }
                })
        }

    });

})
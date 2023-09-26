$(document).ready(() => {
    $('.track-order').hide();
    trckOrder = (id) => {
        $(`#order${id}`).slideToggle();
    }

    cancelOrder = (product_id, order_id) => {
        swal({
            title: "Are you sure ?",
            text: `Are you sure want to cancel this order ?`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willDelete) => {
                if (willDelete) {
                    await fetch(`/orders/cancel_order/${product_id}/${order_id}`, {
                        method: 'GET'
                    }).then(response => response.json())
                        .then(data => {
                            if(data.success){
                                
                                swal({
                                    icon: "success",
                                    title: "Order Cancelled",
                                    text: "Your order has been cancelled",
                                })

                                setTimeout(() => {
                                    location.assign('/orders')
                                },1500)
                            }
                        })
                }
            });
    }

})
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

    // download invoice
    // /user/orders/get-invoice?productId={{this.items.product_id}}&orderId={{this._id}}
    downloadInvoice = async (product_id, order_id) => {
        let timerInterval
        Swal.fire({
            title: 'downloading...',
            timer: 1000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log('I was closed by the timer')
            }
        })

        await fetch(`/orders/get-invoice?productId=${product_id}&orderId=${order_id}`, {
            method: 'GET',
        }).then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'invoice.pdf';
                document.body.appendChild(a);
                a.click();
            })
    }

})
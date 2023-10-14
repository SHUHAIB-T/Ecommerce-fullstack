$.validator.addMethod(
    "positive",
    function (value, element) {
        return parseFloat(value) >= 0;
    },
    "Please enter a positive number"
);

$.validator.addMethod(
    "lessThan100",
    function (value, element) {
        return parseFloat(value) <= 100;
    },
    "Please enter a percentage value."
);

$("#new-coupon").validate({
    rules: {
        coupon_code: {
            required: true,
            maxlength: 80,
        },
        discount: {
            required: true,
            positive: true,
            lessThan100: true
        },
        start_date: {
            required: true,
        },
        exp_date: {
            required: true,
        },
        min_amount: {
            required: true,
            number: true,
            positive: true,
        },
        max_count: {
            required: true,
            number: true,
            positive: true,
        },
        discription: {
            required: true
        }
    },

    submitHandler: function (form) {
        Swal.fire({
            title: "Are you sure?",
            text: "are you sure want to create coupen",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0061bc",
            cancelButtonColor: "rgb(128, 128, 128)",
            confirmButtonText: "Yes",
        }).then(async (result) => {
            if (result.isConfirmed) {
                console.log("confirmed");
                const form = document.getElementById("new-coupon");
                const formData = new FormData(form);
                const payload = Object.fromEntries(formData);
                console.log(payload)
                await fetch('/admin/coupens/create-coupen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Created!',
                                'New Coupen has been created.',
                                'success'
                            ).then(() => {
                                location.assign('/admin/coupens');
                            })
                        }
                    })

            }
        });
    }
});


// edit coupen
$("#edit-coupon").validate({
    rules: {
        coupon_code: {
            required: true,
            maxlength: 80,
        },
        discount: {
            required: true,
            positive: true,
            lessThan100: true
        },
        start_date: {
            required: true,
        },
        exp_date: {
            required: true,
        },
        max_count: {
            required: true,
            number: true,
            positive: true,
        },
        discription: {
            required: true
        }
    }
});

// edit coupen 
const editCoupen = (id) => {
    Swal.fire({
        title: "Are you sure?",
        text: "are you sure want to edit coupen",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0061bc",
        cancelButtonColor: "rgb(128, 128, 128)",
        confirmButtonText: "Yes",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const form = document.getElementById('edit-coupon');
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData);
            console.log(payload)
            console.log(id)
            await fetch(`/admin/coupens/edit-coupen/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire(
                            'Editted!',
                            'The Coupen editted successfully',
                            'success'
                        ).then(() => {
                            location.assign('/admin/coupens');
                        })
                    }
                })

        }
    });

}


//delete coupen 
const deleteCoupen = (id) => {
    Swal.fire({
        title: "Are you sure?",
        text: "are you sure want to Delete this coupen",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0061bc",
        cancelButtonColor: "rgb(128, 128, 128)",
        confirmButtonText: "Yes",
    }).then(async (result) => {
        if (result.isConfirmed) {
            await fetch(`/admin/coupens/delete-coupen/${id}`, {
                method: 'GET'
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire(
                            'Editted!',
                            'The Coupen deleted successfully',
                            'success'
                        ).then(() => {
                            location.assign('/admin/coupens');
                        })
                    }
                })

        }
    });
}
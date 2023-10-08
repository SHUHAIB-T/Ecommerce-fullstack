$('.star').on('click', (e) => {
    const rating = e.target.id;
    $('.star').removeClass('fa-solid')
    $('.star').addClass('fa-regular');
    for (let i = 0; i <= rating; i++) {
        $('#' + i).removeClass('fa-regular');
        $('#' + i).addClass('fa-solid');
    }
    $('#rating').val(e.target.id)
})

let ratingg = $("#rating").val();
for (let i = 0; i <= ratingg; i++) {
    $('#' + i).removeClass('fa-regular');
    $('#' + i).addClass('fa-solid');
}

// rating form
$('#rating-form').validate({
    rules: {
        rating: {
            required: true
        },
        comment: {
            required: true
        }
    },
    submitHandler: async (form) => {
        if (rating.value !== '') {
            const formn = document.getElementById('rating-form');
            const formData = new FormData(formn);
            const payload = Object.fromEntries(formData);
            await fetch(`/reviews/add-review`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Your rating has been submitted',
                        }).then(() => {
                            location.assign('/reviews');
                        })
                    }
                })
                .catch(err => {
                    console.log(err);
                })

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select a rating',
            })
        }
    }
})

// edit form
$('#edit-rating-form').validate({
    rules: {
        rating: {
            required: true
        },
        comment: {
            required: true
        }
    },
    submitHandler: async (form) => {
        if (rating.value !== '') {
            const formn = document.getElementById('edit-rating-form');
            const formData = new FormData(formn);
            const payload = Object.fromEntries(formData);
            await fetch(`/reviews/edit_review`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Your rating has been editted',
                        }).then(() => {
                            location.assign('/reviews');
                        })
                    }
                })
                .catch(err => {
                    console.log(err);
                })

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select a rating',
            })
        }
    }
})

// delete review
// /reviews/delete-reivew/{{this._id}}
const deleteReview = async (id) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `Are you sure want to delete`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1d4391',
        cancelButtonColor: 'rgb(107, 119, 136)',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await fetch(`/reviews/delete-reivew/${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Your rating has been deleted',
                        }).then(() => {
                            location.assign('/reviews');
                        })
                    }
                })
        }
    })
}
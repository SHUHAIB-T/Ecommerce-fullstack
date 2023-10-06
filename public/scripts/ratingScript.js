const star1 = document.getElementById('str1');
const star2 = document.getElementById('str2');
const star3 = document.getElementById('str3');
const star4 = document.getElementById('str4');
const star5 = document.getElementById('str5');
let rating = document.getElementById('rating');

// star 1
star1.addEventListener('click', (e) => {
    e.preventDefault();
    star1.classList.remove('fa-regular');
    star1.classList.add('fa-solid');
    star2.classList.remove('fa-solid');
    star3.classList.remove('fa-solid');
    star4.classList.remove('fa-solid');
    star5.classList.remove('fa-solid');

    star2.classList.add('fa-regular');
    star3.classList.add('fa-regular');
    star4.classList.add('fa-regular');
    star5.classList.add('fa-regular');
    rating.value = 1;
});

// star 2
star2.addEventListener('click', (e) => {
    e.preventDefault();
    star1.classList.remove('fa-regular');
    star2.classList.remove('fa-regular');
    star1.classList.add('fa-solid');
    star2.classList.add('fa-solid');

    star3.classList.remove('fa-solid');
    star4.classList.remove('fa-solid');
    star5.classList.remove('fa-solid');
    star3.classList.add('fa-regular');
    star4.classList.add('fa-regular');
    star5.classList.add('fa-regular');
    rating.value = 2;
});

// star 3
star3.addEventListener('click', (e) => {
    e.preventDefault();
    star1.classList.remove('fa-regular');
    star2.classList.remove('fa-regular');
    star3.classList.remove('fa-regular');
    star1.classList.add('fa-solid');
    star2.classList.add('fa-solid');
    star3.classList.add('fa-solid');

    star4.classList.remove('fa-solid');
    star5.classList.remove('fa-solid');
    star4.classList.add('fa-regular');
    star5.classList.add('fa-regular');
    rating.value = 3;
});

// star 4
star4.addEventListener('click', (e) => {
    e.preventDefault();
    star1.classList.remove('fa-regular');
    star2.classList.remove('fa-regular');
    star3.classList.remove('fa-regular');
    star4.classList.remove('fa-regular');
    star1.classList.add('fa-solid');
    star2.classList.add('fa-solid');
    star3.classList.add('fa-solid');
    star4.classList.add('fa-solid');


    star5.classList.remove('fa-solid');
    star5.classList.add('fa-regular');
    rating.value = 4;
});

// star 5
star5.addEventListener('click', (e) => {
    e.preventDefault();
    star1.classList.remove('fa-regular');
    star2.classList.remove('fa-regular');
    star3.classList.remove('fa-regular');
    star4.classList.remove('fa-regular');
    star5.classList.remove('fa-regular');
    star1.classList.add('fa-solid');
    star2.classList.add('fa-solid');
    star3.classList.add('fa-solid');
    star4.classList.add('fa-solid');
    star5.classList.add('fa-solid');

    rating.value = 5;
});

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



// /admin/products/add-product

$("#image").on("change", function () {
    if ($("#image")[0].files.length > 3) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'You can select maximum of 3 images'
        })
        $(this).val('')
    }
});

$('#primaryIMG').on('change', (e) => {
    let container = document.getElementById('crp-container')
    container.style.display = "block"
    let image = document.getElementById('images')
    let file = e.target.files[0]
    $('.btn-group').hide();
    if (file) {
        // Create a new FileReader to read the selected image file
        var reader = new FileReader(file);
        reader.onload = function (event) {
            // Set the source of the image element in the Cropper container
            document.getElementById('images').src = event.target.result;
            // Initialize Cropper.js with the updated image source
            let cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                viewMode: 0,
                autoCrop: true,
                background: false,
            })

            $('#cropImageBtn').on('click', function () {
                var cropedImg = cropper.getCroppedCanvas()
                if (cropedImg) {
                    cropedImg = cropedImg.toDataURL('image/png')
                    document.getElementById('prev').src = cropedImg
                    document.getElementById('result').value = cropedImg
                    container.style.display = "none"
                    $('.btn-group').show()
                }
                cropper.destroy();
            })
        };
        reader.readAsDataURL(file);
    }


})
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


$("#addProductForm").validate({
    rules: {
        product_name: {
            required: true,
            maxlength: 80,
        },
        brand_name: {
            required: true,
            maxlength: 15,
        },
        stock: {
            required: true,
            number: true,
            positive: true,
        },
        prod_price: {
            required: true,
            number: true,
            positive: true,
        },
        sellig_price: {
            required: true,
            number: true,
            positive: true,
        },
        GST: {
            required: true,
            number: true,
            positive: true,
            lessThan100: true,
        },
        color: {
            required: true,
        },
        description: {
            required: true,
        },
    },

    submitHandler: function (form) {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to add new product?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0061bc",
            cancelButtonColor: "rgb(128, 128, 128)",
            confirmButtonText: "Yes",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const form = document.getElementById("addProductForm");
                try {
                    const formData = new FormData(form);
                    const base64String =
                        document.getElementById("result").value;
                    const base64Data = base64String.split(",")[1];
                    const binaryData = atob(base64Data);
                    const uint8Array = new Uint8Array(
                        binaryData.length
                    );
                    for (let i = 0; i < binaryData.length; i++) {
                        uint8Array[i] = binaryData.charCodeAt(i);
                    }
                    const blob = new Blob([uint8Array], {
                        type: "image/png",
                    });
                    const file = new File([blob], "image.png", {
                        type: "image/png",
                    });
                    
                    formData.append("primaryImage", file);
                    let res = await fetch(
                        "/admin/products/add-product",
                        {
                            method: "POST",
                            body: formData
                        }
                    );
                    let data = await res.json();
                    if (data.success) {
                        Swal.fire(
                            "Created!",
                            "New product has been created successfully.",
                            "success"
                        ).then(() =>
                            location.assign("/admin/products")
                        );
                    } else {
                        throw new Error(data.message);
                    }
                } catch (e) {
                    Swal.fire("Error!", e.message, "error");
                }
            }
        });
    },
});
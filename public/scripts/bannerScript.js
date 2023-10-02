// new-banner


$('#banner_image').on('change', (e) => {
    let container = document.getElementById('banner-crp-container')
    container.style.display = "block"
    let image = document.getElementById('bannerIMG')
    let file = e.target.files[0]
    $('.button-grp').hide();
    if (file) {
        // Create a new FileReader to read the selected image file
        var reader = new FileReader(file);
        reader.onload = function (event) {
            // Set the source of the image element in the Cropper container
            document.getElementById('bannerIMG').src = event.target.result;
            // Initialize Cropper.js with the updated image source
            let cropper = new Cropper(image, {
                aspectRatio: 16 / 5,
                viewMode: 0,
                autoCrop: true,
                background: false,
            })

            $('#cropImageBtn').on('click', function () {
                var cropedImg = cropper.getCroppedCanvas()
                if (cropedImg) {
                    cropedImg = cropedImg.toDataURL('image/png')
                    document.getElementById('banner_prev').src = cropedImg
                    document.getElementById('cropped_banner').value = cropedImg
                    container.style.display = "none"
                    $('.button-grp').show()
                }
                cropper.destroy();
            })
        };
        reader.readAsDataURL(file);
    }
});

// add new banner
$('#new-banner').validate({
    rules: {
        banner_name: {
            required: true,
            maxlength: 20
        },
        banner_image: {
            required: true
        },
        reference: {
            required: true
        }
    },
    submitHandler: function (form) {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to add new Banner?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0061bc",
            cancelButtonColor: "rgb(128, 128, 128)",
            confirmButtonText: "Yes",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const form = document.getElementById("new-banner");
                try {
                    const formData = new FormData(form);
                    console.log(formData)
                    const base64String = document.getElementById("cropped_banner").value;
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
                    formData.append("banner_image", file);
                    console.log(formData)
                    let res = await fetch(
                        "/admin/banners/create-banner",
                        {
                            method: "POST",
                            body: formData
                        }
                    );
                    let data = await res.json();
                    if (data.success) {
                        Swal.fire(
                            "Created!",
                            "New banner has been created successfully.",
                            "success"
                        ).then(() =>
                            location.assign("/admin/banners")
                        );
                    } else {
                        throw new Error(data.message);
                    }
                } catch (e) {
                    Swal.fire("Error!", e.message, "error");
                }
            }
        });
    }
})

// edit banner
$('#edit-banner').validate({
    rules: {
        banner_name: {
            required: true,
            maxlength: 20
        },
        reference: {
            required: true
        }
    },
    submitHandler: function (form) {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to Edit this Banner?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0061bc",
            cancelButtonColor: "rgb(128, 128, 128)",
            confirmButtonText: "Yes",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const form = document.getElementById("edit-banner");
                try {
                    const formData = new FormData(form);
                    let body = Object.fromEntries(formData);
                    let id = body.banner_id
                    const image_string = document.getElementById("cropped_banner").value;
                    if (image_string) {
                        const base64String = image_string
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
                        formData.append("banner_image", file);
                        let res = await fetch(
                            `/admin/banners/edit-banner/${id}`,
                            {
                                method: "POST",
                                body: formData
                            }
                        );
                        let data = await res.json();
                        if (data.success) {
                            Swal.fire(
                                "Editted!",
                                "Banner Edited successfully.",
                                "success"
                            ).then(() =>
                                location.assign("/admin/banners")
                            );
                        } else {
                            throw new Error(data.message);
                        }
                    } else {
                        let res = await fetch(
                            `/admin/banners/edit-banner/${id}`,
                            {
                                method: "POST",
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                        let data = await res.json();
                        if (data.success) {
                            Swal.fire(
                                "Editted!",
                                "Banner Edited successfully.",
                                "success"
                            ).then(() =>
                                location.assign("/admin/banners")
                            );
                        } else {
                            throw new Error(data.message);
                        }
                    }
                } catch (e) {
                    Swal.fire("Error!", e.message, "error");
                }
            }
        });
    }
});

// deleting banner
const deleteBanner = (id, imageName) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await fetch(`/admin/banners/delete-banner?id=${id}&image=${imageName}`)
                    .then(responses => responses.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Deleted!',
                                'Your file has been deleted.',
                                'success'
                            ).then(() => {
                                location.assign('/admin/banners');
                            })
                        }
                    })
            } catch (err) {
                console.log(err)
            }
        }
    })
}
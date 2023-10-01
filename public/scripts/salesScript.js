$(document).ready(() => {
    new DataTable('#exportToTable');
    $('.filterDiv').hide();
    $('.filter-show').on('click', () => {
        $('.filterDiv').slideToggle();
    })

    //pdf download
    $("#exportToButton").click(function () {
        Swal.fire({
            title: 'Are you sure',
            text: "Are you want to download sales Report",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#D3DBEE',
            confirmButtonText: 'Download'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Downloading..',
                    'Your file is being downloadig.',
                    'success'
                ).then(() => {
                    const dataSource = shield.DataSource.create({
                        data: "#exportToTable",
                        schema: {
                            type: "table",
                            fields: {
                                Customer: { type: String },
                                Product_Name: { type: String },
                                Ordered_Date: { type: String },
                                Delivered_Date: { type: String },
                                Quantity: { type: String },
                                Category: { type: String },
                                Payment: { type: String },
                                Amount: { type: Number }
                            }
                        }
                    });

                    dataSource.read().then(function (data) {
                        var pdf = new shield.exp.PDFDocument({
                            author: "TimesCart",
                            created: new Date()
                        });
                        pdf.addPage("a4", "landscape");
                        pdf.table(
                            50,
                            50,
                            data,
                            [
                                { field: "Customer", title: "Customer", width: 70 },
                                { field: "Product_Name", title: "Product Name", width: 100 },
                                { field: "Ordered_Date", title: "Ordered Date", width: 100 },
                                { field: "Delivered_Date", title: "Delivered Date", width: 100 },
                                { field: "Quantity", title: "Quantity", width: 70 },
                                { field: "Category", title: "Category", width: 100 },
                                { field: "Payment", title: "Payment", width: 100 },
                                { field: "Amount", title: "Amount", width: 70 },

                            ],
                            {
                                margins: {
                                    top: 50
                                }
                            }
                        );

                        pdf.saveAs({
                            fileName: "SalesReport"
                        });
                    });
                })
            }

        })
    });
});
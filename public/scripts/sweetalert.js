$(document).ready(function () {
    new DataTable('#example');

    //timout for alert message
    setTimeout(() => {
        $('.alert').toggle()
      }, 2500)

    //delete alert
    confirmAlert = (id,name) => {
      swal({
        title: "Are you sure ?",
        text: `Are you sure want to delete ${name}`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then((willDelete) => {
          if (willDelete) {
            location.assign(`/admin/categories/delete_category/${id}`)
          }
        });
    }

    //block alert
    blockUser = (id,name) => {
        swal({
          title: "Are you sure ?",
          text: `Are you sure want to Block ${name}`,
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
          .then((willDelete) => {
            if (willDelete) {
              location.assign(`/admin/customers/change_status/${id}`)
            }
          });
      }

      //unbloack function
      unblockUser = (id,name) => {
        swal({
          title: "Are you sure ?",
          text: `Are you sure want to Unblock ${name}`,
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
          .then((willDelete) => {
            if (willDelete) {
              location.assign(`/admin/customers/change_status_unblock/${id}`)
            }
          });
      }

      //logout alert
      confirmLogout = (fname,lname) => {
        swal({
          title: "Are you sure ?",
          text: `Are you sure want to logout ${fname} ${lname}`,
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
          .then((willDelete) => {
            if (willDelete) {
              location.assign(`/admin/logout`)
            }
          });
      }

      deleteAlert = (id,name) => {
        swal({
            title: "Are you sure ?",
            text: `Are you sure want to delete ${name}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
            .then((willDelete) => {
              if (willDelete) {
                location.assign(`/admin/products/delete_products/${id}`)
              }
            });
      }
      delete_Adrs_Alert = (id) => {
        swal({
            title: "Are you sure ?",
            text: `Are you sure want to delete this Address`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
            .then((willDelete) => {
              if (willDelete) {
                location.assign(`/my-account/my-address/delete-address/${id}`)
              }
            });
      }
  });
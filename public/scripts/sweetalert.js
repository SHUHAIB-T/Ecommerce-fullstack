$(document).ready(function () {
  new DataTable('#example');

  //timout for alert message
  setTimeout(() => {
    $('.alert').toggle()
  }, 2500)

  //delete alert
  confirmAlert = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure want to delete ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4391',
      cancelButtonColor: 'rgb(107, 119, 136)',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        location.assign(`/admin/categories/delete_category/${id}`)
      }
    })
  }

  //block alert
  blockUser = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure want to Block ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4391',
      cancelButtonColor: 'rgb(107, 119, 136)',
      confirmButtonText: 'Yes, block it!'
    }).then((result) => {
      if (result.isConfirmed) {
        location.assign(`/admin/customers/change_status/${id}`)
      }
    })
  }

  //unbloack function
  unblockUser = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure want to Unblock ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4391',
      cancelButtonColor: 'rgb(107, 119, 136)',
      confirmButtonText: 'Yes, Unblock it!'
    }).then((result) => {
      if (result.isConfirmed) {
        location.assign(`/admin/customers/change_status_unblock/${id}`)
      }
    })
  }

  //logout alert
  confirmLogout = (fname, lname) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure want to logout ${fname} ${lname}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4391',
      cancelButtonColor: 'rgb(107, 119, 136)',
      confirmButtonText: 'Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        location.assign(`/admin/logout`)
      }
    })
  }

  deleteAlert = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure want to delete ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4391',
      cancelButtonColor: 'rgb(107, 119, 136)',
      confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        location.assign(`/admin/products/delete_products/${id}`)
      }
    })
  }
  delete_Adrs_Alert = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure want to delete this Address`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4391',
      cancelButtonColor: 'rgb(107, 119, 136)',
      confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        location.assign(`/my-account/my-address/delete-address/${id}`)
      }
    })
  }
});
const genBTN = document.getElementById("btn-gen")
const dev = document.getElementById("btn")
const very = document.getElementById('btn-very')
const emailInput = document.getElementById('email-input')
const otp_input = document.getElementById('otp')
const show_mail = document.getElementById('email-id')
const error_message = document.getElementById('error-message')

if (genBTN) {
  genBTN.addEventListener('click', () => {
    const email = document.getElementById("email").value;
    console.log(email)
    dev.style.display = 'none'
    genBTN.style.display = 'none'
    very.style.display = 'block'
    emailInput.style.display = 'none'
    otp_input.style.display = 'block'
    try {
      fetch('/admin/forget-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
        .then(response => response.json())
        .then(data => {
          show_mail.textContent = data;
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (err) {
      console.log(err)
    }
  })
}


//verify otp fetch
if (very) {
  very.addEventListener('click', () => {
    const otp = document.getElementById('otp-input').value;
    const email = document.getElementById("email").value;
    try {
      fetch('/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })
        .then(response => response.json())
        .then(data => {
          error_message.textContent = data?.msg;
          if (data.success) {
            location.assign('/admin/reset-pass')
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (err) {
      console.log(err)
    }
  })
}
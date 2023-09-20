
$(document).ready(function () {
    const checkBox = document.getElementById('checkBox');
    $('.checkbox').prop('checked', false);
    $('.pass').hide();
    $('.but').show();
    $('.but_new').hide();
    $('.Update_pass').hide();
    $('.confirm_new_pass').hide();

    if (checkBox) {
        checkBox.addEventListener('click', () => {
            if (checkBox.checked) {
                $('.pass').animate({
                    height: 'show',
                    opacity: 1  
                }, 500);
                $('.but_new').animate({
                    height: 'show',
                    opacity: 1
                }, 500);
                $('.but').slideToggle();
                $('.Update_pass').hide();
                $('.confirm_new_pass').hide();

            } else {
                $('.pass').animate({
                    height: 'hide',
                }, 500);
                $('.but_new').animate({
                    height: 'hide',
                }, 500);
                $('.but').slideToggle();
                $('.Update_pass').hide();
                $('.confirm_new_pass').hide();
            }
        });
    }



    //update user details
    let submit = document.getElementById('update_btn');
    submit.addEventListener('click', async (e) => {
        e.preventDefault();
        //user id
        let _id = document.getElementById('user_id').value;

        let name = document.getElementById('user_name').value;
        let email = document.getElementById('user_email').value;
        let mobile = document.getElementById('user_mobile').value;

        let namerr = document.getElementById('name-Err');
        let mailerr = document.getElementById('mail-Err');
        let phonerr = document.getElementById('phone-Err');

        namerr.textContent = '';
        mailerr.textContent = '';
        mailerr.textContent = '';

        let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

        switch (true) {
            case name === '': namerr.textContent = 'this Field is required';
                break;
            case regex.test(email) != true: mailerr.textContent = 'Enter a Valid mail Id';
                break;
            case mobile.length != 10: phonerr.textContent = 'Enter a valid Number';
                break;
            default:
                let payload = {
                    user_name: name,
                    user_email: email,
                    user_mobile: mobile
                }
                await fetch(`/my-account/update-detail/${_id}`, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' }
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.assign('/my-account');
                        }
                    })

        }
    })

    //update password
    const verify_pass = document.getElementById('verify_pass');

    if (verify_pass) {
        verify_pass.addEventListener('click', async (e) => {
            e.preventDefault();
            let curr_pass = document.getElementById('current_pass').value;
            var _id = document.getElementById('user_id').value;

            let cur_pass_err = document.getElementById('cur_pass_err');

            cur_pass_err.textContent = '';

            await fetch(`/my-account/verify/${_id}`, {
                method: 'POST',
                body: JSON.stringify({ password: curr_pass }),
                headers: { 'Content-Type': 'application/json' }
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        cur_pass_err.textContent = ''
                        $('.pass').animate({
                            height: 'hide',
                        }, 500);
                        $('.but_new').animate({
                            height: 'hide',
                        }, 500);
                        $('.Update_pass').show();
                        $('.confirm_new_pass').show();
                    } else {
                        cur_pass_err.textContent = data?.msg
                    }
                })
        })
    }

    let update_password = document.getElementById('Update_pass');

    if (update_password) {
        update_password.addEventListener('click',async (e) => {
            e.preventDefault();
            const newPass = document.getElementById('new_password_id');
            const confirmPass = document.getElementById('confirm_new_pass_id');

            let new_pass_err = document.getElementById('new_pass_err');
            let confim_pass_err = document.getElementById('confim_pass_err');

            new_pass_err.textContent = '';
            confim_pass_err.textContent = '';
            switch (true) {
                case newPass.value === '' : new_pass_err.textContent = 'This field id is required'
                    break;
                case confirmPass.value === '' : confim_pass_err.textContent = 'this field is required'
                    break;
                case newPass.value !== confirmPass.value : new_pass_err.textContent= 'Passwod is not matching'
                    break;
                default:
                    let paylod = {
                        user_password : newPass.value
                    }
                    var _id = document.getElementById('user_id').value;
                    await fetch(`/my-account/upadate_pass/${_id}`,{
                        method:'POST',
                        body: JSON.stringify(paylod),
                        headers:{'Content-Type':'application/json'}

                    }).then(response => response.json())
                    .then(data => {
                        if(data.success){
                            location.assign('/my-account');
                        }
                    })
            }
        })
    }

    
});
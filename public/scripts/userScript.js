const gen_btn = document.getElementById("gen_btn");
const otp_div = document.getElementById("otpinput");
const emailAddress = document.getElementById("emailAddress");
const phoneNumber = document.getElementById("phoneNumber");
const Password = document.getElementById('Password');
const Name = document.getElementById('Name');
const showEmail = document.getElementById('Email-id');
const clearBTN= document.getElementById('clearBTN');
const verify_btn = document.getElementById('verify_btn');

const OTPerr = document.getElementById('OTP-err');
const Passerr = document.getElementById('Pass-err');
const Phoneerr = document.getElementById('Phone-err');
const Emailerr = document.getElementById('Email-err');
const Nameerr = document.getElementById('Name-err');



if (gen_btn) {
    gen_btn.addEventListener('click', async(e) => {
        OTPerr.textContent = '';
        Passerr.textContent = '';
        Phoneerr.textContent = '';
        Emailerr.textContent = '';
        Nameerr.textContent = '';
        e.preventDefault()
        let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        switch (true) {
            case Name.value === '': Nameerr.textContent = "this field is required"
                break;
            case emailAddress.value === '': Emailerr.textContent = "this field is required";
                break;
            case regex.test(emailAddress.value) != true: Emailerr.textContent = "Enter a valid email Address";
                break;
            case phoneNumber.value.length !== 10: Phoneerr.textContent = "Enter a valid Phone number";
                break;
            case Password.value.length < 5: Passerr.textContent = "Password must have 5 charechter ";
                break;
            default:
                emailAddress.disabled = true;
                Name.disabled = true;
                Password.disabled = true;
                phoneNumber.disabled = true;
                otp_div.style.display = 'block';
                gen_btn.style.display = 'none';
                clearBTN.style.display = 'none';
                verify_btn.style.display = 'block'
                

                try{
                    await fetch('/get-signup-otp',{
                        method:'POST',
                        body: JSON.stringify({user_email:emailAddress.value}),
                        headers: {'Content-Type': 'application/json'}
                    })
                    .then(response => response.json())
                    .then(data => {
                        showEmail.textContent = data
                    }).catch((err) => {
                        console.log(err)
                    })
                }catch(err){
                    console.log(err)
                }
            }
    })
}

if(verify_btn){
    verify_btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('Otp-input').value;
        const user_email = emailAddress.value;
        const user_password = Password.value;
        const user_mobile = phoneNumber.value;
        const user_name = Name.value;
        try{
            await fetch('/veryfy-otp',{
                method:'POST',
                headers:{'Content-Type': 'application/json'},
                body:JSON.stringify({otp,user_email,user_password,user_mobile,user_name})
            })
            .then(response => response.json())
            .then(data => {
                OTPerr.textContent = data?.msg;
                if(data.err){
                    Emailerr.textContent = data.err;
                    Name.disabled = false;
                    Password.disabled = false;
                    phoneNumber.disabled = false;
                    emailAddress.disabled = false;
                    otp_div.style.display = 'none';
                    gen_btn.style.display = 'block';
                    clearBTN.style.display = 'block';
                    verify_btn.style.display = 'none'

                }   
                if(data.success){
                    location.assign('/login')
                }
            })
        }catch(err){
            console.log(err)
        }
    })
}


function Validator(options) {

    function getParent (element , selector) {
            while (element.parentElement) {
                if (element.parentElement.matches(selector)) {
                    return element.parentElement
                }
                element = element.parentElement
            }
    }

    var selectorRules = {}

    
    function Validate (inputElement,rule) {

        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        //Lấy ra các rule của selector
        var rules = selectorRules[rule.selector]

        //Lặp qua từng rule
        //Nếu có lỗi dừng ktra
        for( var i = 0; i < rules.length ; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            
            if (errorMessage) 
                break;
        }
            if (errorMessage)
                            {
                                errorElement.innerText = errorMessage; 
                                getParent(inputElement, options.formGroupSelector).classList.add('invalid')
                            }
            else
                            {
                                errorElement.innerText = '';
                                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                            }
        return !errorMessage;
    }
    // Lấy element của form
    var formElement = document.querySelector(options.form);
    if(formElement)
        {
            formElement.onsubmit = function(e) {
                e.preventDefault();

                var isFormValid = true ;
                options.rules.forEach(function(rule) {
                    var inputElement = formElement.querySelector(rule.selector);
                   
                    var isValid = Validate(inputElement,rule);
                    if (!isValid) {
                        isFormValid = false ;
                    }
                }) 

                
                if(isFormValid) {
                    if (typeof options.onSubmit === 'function') {
                        var enableInputs = formElement.querySelectorAll('[name]');
                        var formValues = Array.from(enableInputs).reduce(function(values,input) {
                            switch (input.type)
                            {
                                case 'radio':
                                    values[input.name] = formElement.querySelector('input[name="'+ input.name + '"]:checked').value;
                                    break; 
                                case 'checkbox':
                                    if(input.matches(':checked')) return values;
                                    if(!Array.isArray(values[input.name]))   {
                                        values[input.name]=[];     
                                    }
                                    values[input.name].push(input.value)
                                    break;
                                case 'file':
                                    values[input.name] = input.files
                                    break;
                                default:
                                
                                    values[input.name] = input.value;
                            }
                            return values;
                        },{});
        
                        options.onSubmit(formValues);
                    }
                    else
                        {
                            formElement.submit();
                        }
            }
        }
        }
            //Lặp qua mỗi rule và xử lý
            options.rules.forEach(function(rule){

//Lưu lại các rule
             if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)     
             }

                else
                    {
                        selectorRules[rule.selector] = [rule.test];
                    }
            
               var inputElements = formElement.querySelectorAll(rule.selector);
               Array.from(inputElements).forEach(function(inputElement){
                     //Xử lý trường hợp blur
                     inputElement.onblur = function () {
                        Validate(inputElement,rule);
                   }
                    // Xử lý mỗi khi nhập
                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }

               })
            });
}

Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập vào trường này'           
        }
    };
}
Validator.isRequired_name = function(selector , message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập vào trường này'           
        }
    };
}
Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    };
}

Validator.isPhone = function(selector) {
    return {
        selector: selector,
        test: function (value) {
            var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
            return vnf_regex.test(value) ? undefined : 'Số điện thoại không hợp lệ'
        }
    };
}

Validator.minLength = function(selector,min) {
    return {
        selector: selector,
        test: function (value) {
            return  value.length >= 6 ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    };
}

Validator.isConfirmed = function (selector,getConfirmValue,message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Gia trị nhập vào không khớp'
        }
        }
}


var courseApi = "http://localhost:3000/courses"


function start() {
    getCourses(renderCourses);
    handleCreateForm();
}

start();


function getCourses(callback) {
    fetch(courseApi) 
       .then(function(response){
        return response.json();
       }) 
       .then(callback);
}
function handleDeleteCourse(id) {
    var options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    fetch(courseApi + '/' + id,options)
        .then(function(response){
            response.json(); 
        })
    .then(function(){
        var courseItem = document.querySelector('.course-item-' + id)
        if(courseItem)
            {
                courseItem.remove();
            }
    });
}

function createCourse (data, callback) {
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    fetch(courseApi,options)
        .then(function(response){
            response.json(); 
        })
    .then(callback);
}



function renderCourses(courses) {
    var listCoursesBlock =
        document.querySelector('#list-courses')
    var htmls = courses.map(function(course){
       return `
       <li class="course-item-${course.id}" >
       <h4>Họ và tên:
       ${course.fullname}</h4>
       <p>Giới tính:
       ${course.gender}</p>
       <p>Sinh nhật:
       ${course.birthday}</p>
       <p>Email:
       ${course.email}</p>
       <p>Tỉnh/TP:
       ${course.city}</p>
       <p>Quận/Huyện:
       ${course.district}</p>
       <p>Phường/Xã:
       ${course.ward}</p>
       <p>Ảnh: 
       ${course.avarta}</p>
       <p>Mật khẩu:
       ${course.password}</p>
       <p>Comment :
       ${course.textbox}</p>
       
        <button onclick="handleDeleteCourse(${course.id})">Xóa</button>
        <button onclick="handlePatchCourse(${course.id})">Sửa</button>
        </li>
       `
    })
    listCoursesBlock.innerHTML = htmls.join('')
    
}


function handleCreateForm() {
    var createBtn = document.querySelector('#create');
    createBtn.onclick = function() {
        var fullname = document.querySelector('#fullname').value;
        var gender = document.querySelector('input[name="gender"]:checked').value;
        var birthday = document.querySelector('#birthday').value;
        var email = document.querySelector('#email').value;
        var phone = document.querySelector('#phone').value;
        var avarta = document.querySelector('#avarta').value;
        var city = document.querySelector('#city').value;
        var district = document.querySelector('#district').value;
        var ward = document.querySelector('#ward').value;
        var password = document.querySelector('#password').value;
        var textbox = document.querySelector('#textbox').value;
       var formData = {
        fullname: fullname, 
        gender: gender,
        birthday: birthday,
        email: email,
        phone: phone,
        city: city,
        district: district,
        ward: ward,
        password: password,
        avarta:avarta,
        textbox:textbox
       }   
       createCourse(formData,function(){
        getCourses(renderCourses);
       }); 
       alert('Cảm ơn bạn đã điền')
    }
}



    var createBtnn = document.querySelector("#create");
    createBtnn.onclick = function() {
        var fullname = document.querySelector('#fullname').value;
        var gender = document.querySelector('input[name="gender"]:checked').value;
        var birthday = document.querySelector('#birthday').value;
        var email = document.querySelector('#email').value;
        var phone = document.querySelector('#phone').value;
        var avarta = document.querySelector('#avarta').value;
        var city = document.querySelector('#city').value;
        var district = document.querySelector('#district').value;
        var ward = document.querySelector('#ward').value;
        var password = document.querySelector('#password').value;
        var textbox = document.querySelector('#textbox').value;
       let data = {
        'entry.392066651': fullname,
        'entry.725491086' : gender,
        'entry.94405496':birthday,
        'entry.1642920523': email, 
        'entry.1478803900': phone,
        'entry.701017272': city,
        'entry.688732736': district,
        'entry.189067818': ward,
        'entry.692688599' : avarta,
        'entry.792384837': password,
        'entry.1738710434': textbox
        }

        let queryString = new URLSearchParams(data);
        queryString = queryString.toString();

        let xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdV4IHA4qF9DxLeXDnj8VfV7dDwrgL9d7DTCBZ9UQ-4lAk7Rg/formResponse', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

        xhr.send(queryString);

        alert('Cảm ơn bạn đã điền !!!')

    }

    const password = document.querySelector('#password');
  
    togglePassword.addEventListener('click', function (e) {
      // toggle the type attribute
      const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
      password.setAttribute('type', type);
      // toggle the eye slash icon
      this.classList.toggle('fa-eye-slash');
  });
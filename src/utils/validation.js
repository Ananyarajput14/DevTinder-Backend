const validator=require('validator');
const validateData= (req)=>{
    const {firstName,lastName,email,password} = req.body;
if(!firstName || !lastName){
    throw new Error("Name is not valid");
}else if(!validator.isEmail(email)){
    throw new Error("Email is not valid");
}
else if(!validator.isStrongPassword(password)){
    throw new Error("Enter a strong password");
}
};

const validateEditProfileData=(req) => {
    const allowededitFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "email",
    "about",
    "skills",
    "photoUrl"
    ];
    const isEditAllowed= Object.keys(req.body).every((field)=>
    allowededitFields.includes(field)
    );
    return isEditAllowed;
};



module.exports={
    validateData,
    validateEditProfileData
};

const {mongoose,Schema} = require("mongoose")
const bcrypt = require("bcryptjs");
const userSchema = Schema({
   
   username:{
    type:String,
    required:true
   },
   email:{
    type:String,
    
   },

   password:{
    type:String,
    required:true
   }
});


// // Hash password before saving the admin document
// userSchema.pre('save', async function (next) {
//    if (!this.isModified('password')) return next(); // Skip hashing if password is not modified

//    try {
//       const salt = await bcrypt.genSalt(10);  // Generate salt with rounds
//       this.password = await bcrypt.hash(this.password, salt);  // Hash the password
//       next();
//    } catch (error) {
//       next(error);  // Pass any errors to the next middleware
//    }
// });

const User = mongoose.model('User',userSchema);
module.exports = User;
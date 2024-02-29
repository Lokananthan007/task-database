const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  password: { type: String, required: true, select: false }, 
  gender: { type: String, required: true },
  city: { type: String, required: true },
  agreeTerms: { type: Boolean, required: true }, 
  profileImage: { data: Buffer, contentType: String } ,
  document: { data: Buffer, contentType: String } 
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String },
  mobile: { type: String },
  email: { type: String },
  dob: { type: Date },
  password: { type: String },
  gender: { type: String },
  city: { type: String },
  agreeTerms: { type: Boolean },
  profileImage: { data: Buffer, contentType: String },
  document: { data: Buffer, contentType: String },
});

userSchema.pre('save', async function (next) {
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

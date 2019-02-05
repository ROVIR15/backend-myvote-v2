const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const kandidatSchema = new Schema({
  id_ktp:{
    type: Number,
    required: true
  },
  nama_kandidat: {
    type: String,
    required: true
  },
  alamat_kandidat: {
    type: String,
    required: true
  },
  tanggal_lahir: {
    type: Date,
    default: Date.now
  },
  jenis_kelamin: {
    type: String,
    required: true
  },
  jabatan: {
    type: String
  },
  biografi: {
    type: String
  },
  visi_misi: {
    type: String
  },
  proker: {
    type: String
  },
  deskripsi_diri: {
    type: String,
  },
  no_urut: {
    type: Number,
    required: true
  }
});

// usersSchema.methods.generateJWT = function() {
//   const today = new Date();
//   const expirationDate = new Date(today);
//   expirationDate.setDate(today.getDate() + 60);

//   return jwt.sign({
//     email: this.email,
//     id: this._id,
//     exp: parseInt(expirationDate.getTime() / 1000, 10),
//   }, 'secret');
// }

// usersSchema.methods.toAuthJSON = function() {
//   return {
//     _id: this._id,
//     username: this.username,
//     token: this.generateJWT(),
//   };
// };

module.exports = Kandidat = mongoose.model('kandidat', kandidatSchema);
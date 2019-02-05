const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const kegiatanSchema = new Schema({
    id_address_kegiatan: {
      type:  String,
    },
    nama_kegiatan: {
       type: String,
       required: true
    },
    tanggal_mulai: {
      type: Date,
    },
    tanggal_selesai: {
      type: Date,
    },
    waktu_mulai: {
      type: Number
    },
    waktu_akhir: {
      type: Number
    },
    des_kegiatan: {
      type: String
    }
});

// usersSchema.pre('save', async function(next){
//   const user = this;
//   const hash = await bcrypt.hash(this.password, 10);
//   this.password = hash;
// });

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

module.exports = Kegiatan = mongoose.model('kegiatan', kegiatanSchema);

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const detailKegiatanSchema = new Schema({
    id_kandidat: [{
        type: String
    }],
    id_voter: [{
      type: String
    }],
    id_institusi: {
      type: String,
      required: true
    },
    id_admin_penyelenggara: {
      type: String,
      required: true
    },
    id_kegiatan: {
      type: String,
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

module.exports = DetailKegiatan = mongoose.model('detail_kegiatan', detailKegiatanSchema);

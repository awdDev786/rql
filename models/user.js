var db=require('../config.js');
const bcrypt=require('bcrypt');
var userSchema = new db.Schema({
    email: { type: String, unique: true },
    password: { type: String },
    url: { type: String, unique: true },
    project:[{type:db.Schema.Types.ObjectId ,ref:'project'}]
});

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

module.exports=db.rql.model('User', userSchema);

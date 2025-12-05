const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    addresses: [{
        street: String,
        city: String,
        postalCode: String,
        country: {
            type: String,
            enum: ['Singapore', 'Malaysia']
        }
    }],
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockoutUntil: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);

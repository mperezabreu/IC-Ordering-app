const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleWare/auth');

// User Model
const User = require('../../models/User');

// POST auth ,authenticate, public access
router.post('/', (req, res) => {
    const { email, password } = req.body;

    // Validate

    if(!email || !password){
        return res.status(400).json({ msg: "Fill all fields"});
    }

    //Check for user
    User.findOne({ email })
        .then(user => {
            if(!user) return res.status(400).json({ msg: 'User does not exists'});

            // Validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(!isMatch) return res.status(400).json({ msg: 'Not valid credentials'});
                    
                    jwt.sign(
                        { id: user.id }, 
                        config.get('jwtSecret'),
                        { expiresIn: 1800 },
                        (err, token) => {
                            if(err) throw err;
                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email
                                }
                            });
                        }
                    )
                });
        })
});

//
router.get('/user', auth, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .then(user => res.json(user));

});

module.exports = router;
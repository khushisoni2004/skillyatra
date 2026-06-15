const jwt = require('jsonwebtoken');
module.exports = function generateToken(id){ return jwt.sign({ id }, process.env.JWT_SECRET || 'skillyatra_secret_2026', { expiresIn: '30d' }); };

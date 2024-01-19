const pool = require('../../config/database');

const registerUser = async (fullName, email, password) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const queryText = 'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *';
        const values = [fullName, email, password];
        const result = await client.query(queryText, values);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};



// Register endpoint
const register_user = async (req, res) => {
    const { fullName, email, password, confirmPassword } = req.body;
    console.log(req.body)

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const user = await registerUser(fullName, email, password);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = { register_user, registerUser }
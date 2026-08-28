const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

(async () => {
  const uploadDir = path.join(__dirname, 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
})();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',           // ← CHANGE THIS IF YOUR PASSWORD IS DIFFERENT
  database: 'city_problems_reporting',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection test: OK');
  } catch (err) {
    console.error('Database connection FAILED:', err.message);
  }
})();

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
}


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {

    let rows = await query(
      'SELECT * FROM supervisors WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length > 0) {
      return res.json({ success: true, user: rows[0], role: 'supervisor' });
    }

    rows = await query(
      'SELECT * FROM residents WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length > 0) {
      if (rows[0].is_approved === 0) {
        return res.json({ success: false, message: 'Account pending approval.' });
      }
      return res.json({ success: true, user: rows[0], role: 'resident' });
    }

    rows = await query(
      'SELECT * FROM workers WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length > 0) {
      if (rows[0].is_approved === 0) {
        return res.json({ success: false, message: 'Account pending approval.' });
      }
      return res.json({ success: true, user: rows[0], role: 'worker' });
    }

    return res.json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

app.post('/api/register', async (req, res) => {
  const { role, username, password, name, phone, email, address } = req.body;
  const table = role === 'resident' ? 'residents' : 'workers';

  try {
    await query(
      `INSERT INTO ${table} (full_name, username, password, phone, email, address, is_approved) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [name, username, password, phone || null, email || null, address || null]
    );
    res.json({ success: true, message: 'Registration successful! Waiting for supervisor approval.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: 'Username already taken.' });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

app.post('/api/approve', async (req, res) => {
  const { id, role } = req.body;
  const table = role === 'resident' ? 'residents' : 'workers';

  try {
    const result = await query(`UPDATE ${table} SET is_approved = 1 WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'User not found or already approved' });
    }
    res.json({ success: true, message: 'User approved successfully' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/delete-user', async (req, res) => {
  const { id, role } = req.body;
  const table = role === 'resident' ? 'residents' : 'workers';

  try {
    const result = await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Cannot delete - user may have related records' });
  }
});

app.post('/api/request', upload.single('attachment'), async (req, res) => {
  const { residentId, type, description } = req.body;
  const filename = req.file ? req.file.filename : null;

  try {
    await query(
      'INSERT INTO requests (resident_id, type, description, status, attachment) VALUES (?, ?, ?, "Pending", ?)',
      [residentId, type, description, filename]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ success: false, message: 'Failed to create request' });
  }
});

app.post('/api/assign', async (req, res) => {
  const { requestId, workerId } = req.body;

  try {
    const result = await query(
      'UPDATE requests SET assigned_worker_id = ?, status = "Assigned" WHERE id = ?',
      [workerId, requestId]
    );
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/work-complete', async (req, res) => {
  const { requestId } = req.body;

  try {
    const result = await query(
      'UPDATE requests SET status = "Completed" WHERE id = ?',
      [requestId]
    );
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Work complete error:', err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/rate', upload.single('feedbackAttachment'), async (req, res) => {
  const { requestId, rating, feedback } = req.body;
  const filename = req.file ? req.file.filename : null;

  try {
    const result = await query(
      'UPDATE requests SET rating = ?, feedback = ?, feedback_attachment = ? WHERE id = ?',
      [rating, feedback || null, filename, requestId]
    );
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Rate error:', err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/complaint', upload.single('attachment'), async (req, res) => {
  const { workerId, description } = req.body;
  const filename = req.file ? req.file.filename : null;

  try {
    await query(
      'INSERT INTO complaints (worker_id, description, attachment) VALUES (?, ?, ?)',
      [workerId, description, filename]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Complaint error:', err);
    res.status(500).json({ success: false });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const residents = await query('SELECT * FROM residents WHERE is_approved = 1');
    const pendingResidents = await query('SELECT * FROM residents WHERE is_approved = 0');
    const workers = await query('SELECT * FROM workers WHERE is_approved = 1');
    const pendingWorkers = await query('SELECT * FROM workers WHERE is_approved = 0');
    const requests = await query('SELECT * FROM requests');
    const complaints = await query(
      `SELECT c.*, w.full_name as worker_name 
       FROM complaints c 
       JOIN workers w ON c.worker_id = w.id`
    );

    res.json({
      residents,
      pendingResidents,
      workers,
      pendingWorkers,
      requests,
      complaints: complaints || []
    });
  } catch (err) {
    console.error('Data fetch error:', err);
    res.status(500).json({
      residents: [], pendingResidents: [], workers: [], pendingWorkers: [],
      requests: [], complaints: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`Centralized City Problem Reporting Platform backend running on http://localhost:${PORT}`);
});
// server.js
// Cloud-Powered Task Manager - Backend
// Connects to IBM Cloudant and exposes CRUD routes for tasks.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serves index.html from /public

const PORT = process.env.PORT || 3000;
const DB_NAME = 'tasks';

// ---- Connect to IBM Cloudant ----
const authenticator = new IamAuthenticator({ apikey: process.env.CLOUDANT_APIKEY });
const cloudant = new CloudantV1({ authenticator });
cloudant.setServiceUrl(process.env.CLOUDANT_URL);

// ---- Ensure the "tasks" database exists before starting the server ----
async function setupDatabase() {
  try {
    await cloudant.getDatabaseInformation({ db: DB_NAME });
    console.log(`Database "${DB_NAME}" already exists.`);
  } catch (err) {
    if (err.status === 404) {
      await cloudant.putDatabase({ db: DB_NAME });
      console.log(`Database "${DB_NAME}" created.`);
    } else {
      throw err;
    }
  }
}

// ---- Health check route ----
app.get('/ping', (req, res) => {
  res.json({ message: 'Server is running and connected to Cloudant setup.' });
});

// ---- CREATE a task ----
app.post('/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = {
      title,
      description: description || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const response = await cloudant.postDocument({ db: DB_NAME, document: task });
    res.status(201).json({ id: response.result.id, ...task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ---- READ all tasks ----
app.get('/tasks', async (req, res) => {
  try {
    const response = await cloudant.postAllDocs({
      db: DB_NAME,
      includeDocs: true
    });
    const tasks = response.result.rows
      .map(row => row.doc)
      .filter(doc => !doc._id.startsWith('_design')); // skip design docs
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// ---- UPDATE a task (e.g. mark done, edit text) ----
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await cloudant.getDocument({ db: DB_NAME, docId: id });

    const updatedDoc = {
      ...existing.result,
      ...req.body // allows updating title, description, or status
    };

    const response = await cloudant.putDocument({
      db: DB_NAME,
      docId: id,
      document: updatedDoc
    });

    res.json({ id: response.result.id, ...updatedDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ---- DELETE a task ----
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await cloudant.getDocument({ db: DB_NAME, docId: id });

    await cloudant.deleteDocument({
      db: DB_NAME,
      docId: id,
      rev: existing.result._rev
    });

    res.json({ message: 'Task deleted', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ---- Start server ----
setupDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to set up database. Check your .env credentials.', err);
  });

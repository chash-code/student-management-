import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON
app.use(express.json());

// Path to db.json file
const dbPath = path.join(__dirname, 'db.json');

// Helper function to read students from db.json
const readStudents = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write students to db.json
const writeStudents = (students) => {
  fs.writeFileSync(dbPath, JSON.stringify(students, null, 2));
};

// GET /students - Fetch all students
app.get('/students', (req, res) => {
  try {
    const students = readStudents();
    res.status(200).json({
      success: true,
      data: students,
      message: 'Students fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// POST /students - Add a new student
app.post('/students', (req, res) => {
  try {
    const { name, course, year } = req.body;

    // Validation
    if (!name || !course || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, course, and year'
      });
    }

    const students = readStudents();
    
    // Generate new ID
    const newId = students.length > 0 
      ? Math.max(...students.map(s => s.id)) + 1 
      : 1;

    const newStudent = {
      id: newId,
      name,
      course,
      year: parseInt(year)
    };

    students.push(newStudent);
    writeStudents(students);

    res.status(201).json({
      success: true,
      data: newStudent,
      message: 'Student added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding student',
      error: error.message
    });
  }
});

// PUT /students/:id - Update an existing student
app.put('/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, course, year } = req.body;

    const students = readStudents();
    const studentIndex = students.findIndex(s => s.id === parseInt(id));

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Student with id ${id} not found`
      });
    }

    // Update only provided fields
    if (name) students[studentIndex].name = name;
    if (course) students[studentIndex].course = course;
    if (year) students[studentIndex].year = parseInt(year);

    writeStudents(students);

    res.status(200).json({
      success: true,
      data: students[studentIndex],
      message: 'Student updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
});

// DELETE /students/:id - Delete a student
app.delete('/students/:id', (req, res) => {
  try {
    const { id } = req.params;

    const students = readStudents();
    const studentIndex = students.findIndex(s => s.id === parseInt(id));

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Student with id ${id} not found`
      });
    }

    const deletedStudent = students.splice(studentIndex, 1);
    writeStudents(students);

    res.status(200).json({
      success: true,
      data: deletedStudent[0],
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

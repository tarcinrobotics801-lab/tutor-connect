import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary';
import { Tutor } from '../models/Tutor.model';
import { Student } from '../models/Student.model'; // ✅ Import Student model


const router = express.Router();
const upload = multer({ storage });

// POST /api/uploads/tutor-photo/:id
router.post('/tutor-photo/:id', upload.single('photo'), async (req, res) => {
  const tutorId = req.params.id;

  if (!req.file || !('path' in req.file)) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const photoUrl = (req.file as any).path;

  try {
    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      { photo: photoUrl },
      { new: true }
    );

    if (!updatedTutor) {
      res.status(404).json({ message: 'Tutor not found' });
      return;
    }

    res.status(200).json({
      message: 'Photo uploaded successfully',
      photoUrl,
      tutor: updatedTutor
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err });
  }
});

router.post('/student-photo/:id', upload.single('photo'), async (req, res) => {
  const studentId = req.params.id;

  if (!req.file || !('path' in req.file)) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const photoUrl = (req.file as any).path;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { photo: photoUrl },
      { new: true }
    );

    if (!updatedStudent) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json({
      message: 'Photo uploaded successfully',
      photoUrl,
      student: updatedStudent
    });
  } catch (err) {
    console.error('Student upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err });
  }
});

export default router;

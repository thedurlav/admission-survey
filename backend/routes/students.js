const express = require('express');
const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/students — add new survey (surveyor or admin)
router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, surveyedBy: req.user._id };
    const student = await Student.create(data);
    await student.populate('surveyedBy', 'fullName username');
    res.status(201).json(student);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/students/my — surveyor sees only their own
router.get('/my', protect, async (req, res) => {
  try {
    const students = await Student.find({ surveyedBy: req.user._id })
      .populate('surveyedBy', 'fullName username')
      .sort({ surveyDate: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/students — admin sees all
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('surveyedBy', 'fullName username')
      .sort({ surveyDate: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/students/export — Excel export (admin only)
router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('surveyedBy', 'fullName username')
      .sort({ surveyDate: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admission Survey System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Student Surveys', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    sheet.columns = [
      { header: 'S.No', key: 'sno', width: 6 },
      { header: 'Child Name', key: 'childName', width: 20 },
      { header: 'Father Name', key: 'fatherName', width: 20 },
      { header: 'Class', key: 'class', width: 10 },
      { header: 'Medium', key: 'medium', width: 12 },
      { header: 'Previous School', key: 'previousSchool', width: 25 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Mobile No', key: 'mobileNo', width: 14 },
      { header: 'Remarks', key: 'remarks', width: 25 },
      { header: 'Survey Date', key: 'surveyDate', width: 14 },
      { header: 'Surveyed By', key: 'surveyedBy', width: 18 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });
    headerRow.height = 22;

    students.forEach((s, idx) => {
      const row = sheet.addRow({
        sno: idx + 1,
        childName: s.childName,
        fatherName: s.fatherName,
        class: s.class,
        medium: s.medium,
        previousSchool: s.previousSchool || '-',
        location: s.location,
        mobileNo: s.mobileNo,
        remarks: s.remarks || '-',
        surveyDate: s.surveyDate ? new Date(s.surveyDate).toLocaleDateString('en-IN') : '-',
        surveyedBy: s.surveyedBy ? s.surveyedBy.fullName : 'Admin',
      });
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        };
        if (idx % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F8FF' } };
        }
      });
      row.height = 18;
    });

    sheet.autoFilter = { from: 'A1', to: 'K1' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=student_surveys_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Export failed', error: err.message });
  }
});

// DELETE /api/students/:id (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

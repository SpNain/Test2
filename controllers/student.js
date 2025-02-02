const Student = require("../models/student");

exports.getAllStudents = async (req, res, next) => {
  try {
    console.log("getallstudents");
    const allStudents = await Student.findAll();
    console.log(allStudents);
    res.status(200).json(allStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.addStudentData = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Student name is required" });
    }

    const student = await Student.create({ name });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Student.destroy({ where: { id } });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.editStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.name = name || student.name;
    await student.save();

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

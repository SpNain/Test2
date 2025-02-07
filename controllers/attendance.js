const Attendance = require("../models/attendance");
const Student = require("../models/student");

exports.getHomePage = async (req, res, next) => {
  try {
    res.sendFile("index.html", { root: "views/user" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
    });
  }
};

exports.addAttendanceDataWithDate = async (req, res) => {
  try {
    const { date, combinedStatus } = req.body;

    if (!date || !combinedStatus || typeof combinedStatus !== "object") {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const ids = Object.keys(combinedStatus); // creates a array of ids
    const allStudents = await Student.findAll({
      // this will execute this -> SELECT * FROM Student WHERE id IN (1, 2, 3);
      where: { id: ids },
    });

    if (allStudents.length !== ids.length) {
      return res
        .status(400)
        .json({ message: "Some students are invalid/missing" });
    }

    // Prepare attendance records and insert them
    for (const student of allStudents) {
      const status = combinedStatus[student.id]; // getting status for a particular single student

      if (status) {
        // Use Sequelize magic method to create attendance entry
        await student.createAttendance({
          date: date,
          status: status,
        });
      }
    }

    res.status(200).json({ message: "Attendance data saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getDateUI = async (req, res) => {
  try {
    const { date } = req.params;

    const attendanceData = await Attendance.findAll({
      where: { date },
      include: Student,
    });

    if (attendanceData.length > 0) {
      res.json({
        attendanceData: attendanceData.map((ele) => ({
          id: ele.Student.id,
          name: ele.Student.name,
          status: ele.status,
        })),
      });
    } else {
      const allStudents = await Student.findAll();
      if (allStudents.length > 0)
        res.json({
          allStudents: allStudents.map((student) => ({
            id: student.id,
            name: student.name,
          })),
        });
      else res.json({ noStudent: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
    });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    // Fetch students along with their attendance records
    const allStudentsWithStatus = await Student.findAll({
      include: [
        {
          model: Attendance,
          attributes: ["status"],
        },
      ],
    });

    // Process the data to compute present count and total attendance count
    const allStudentsAttendanceReport = allStudentsWithStatus.map(
      (studentWithStatus) => {
        const totalAttendance = studentWithStatus.Attendances.length;
        const presentCount = studentWithStatus.Attendances.filter(
          (att) => att.status === "Present"
        ).length;

        return {
          studentId: studentWithStatus.id,
          studentName: studentWithStatus.name,
          presentCount,
          totalAttendance,
        };
      }
    );

    res.status(200).json(allStudentsAttendanceReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
    });
  }
};

/*
getattendance report
json response

[
  {
    "studentId": 1,
    "studentName": "a",
    "presentCount": 3,
    "totalAttendance": 5
  },
  {
    "studentId": 2,
    "studentName": "b",
    "presentCount": 3,
    "totalAttendance": 5
  },
  {
    "studentId": 3,
    "studentName": "c",
    "presentCount": 3,
    "totalAttendance": 5
  }
]


*/

const Student = require('../models/student');


exports.getAllStudents = async(req,res,next)=>{
    try {
        console.log("getallstudents")
        const allStudents = await Student.findAll();
        console.log(allStudents)
        res.status(200).json(allStudents)

    }catch(err){
        console.log("Error while fetching all students", err);
        res.status(500).json({
            error:err
          })
    }

}
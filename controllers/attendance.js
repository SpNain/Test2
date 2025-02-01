const Attendance = require('../models/attendance');
const Student = require('../models/student');

exports.getHomePage = async(req,res,next)=>{
    try{
        res.sendFile('index.html',{root:'views/user'})
    }catch(err){
        console.log("error in getting home page", err);
        res.status(500).json({
            error:err
          })
    }
}

exports.addAttendanceDataWithDate = async (req, res) => {
    try {
        const { Date, combinedStatus } = req.body;
        console.log("aadwd")

        if (!Date || !combinedStatus || typeof combinedStatus !== "object") {
            return res.status(400).json({ message: "Invalid request data" });
        }

        // Fetching students from the database based on ids
        // Why we are doing this ? -> taaki hum check kr ske ki jin jin students ki attendance aayi h
        // wo saare students database me exist krte h ya nhi kyunki aisa ho skta h ki koi id ko manipulate krke bhejde frontend se
        // hmare pass ids ka array h jiski madad se hum un sb students ko nikal lenge jinki ids iss array me h
        // ab jo ids table me nhi h wo student nhi aayenge
        // aur baad me hum check kr lenge ki ids aur allstudents ki length same h ya nhi
        // Case 1 : agr to saari bheji gyi ids complete hogi ya manipulated nhi hogi to saare students aayenge aur length wale if me enter nhi honge
        // Case 2 : agr kuch saari ids nhi aayi hogi ya ids ko manipulate kiya hoga to fir hum length wale if me enter krke reponse send kr denge
        // Case 3 : agr frontend se saari ids na bheji jaaye i mean ki kuch ids ke liye data na bhej jaaye but jo bhi ids aayi h wo saari shi h to fir bhi hum if me enter honge kyunki kuch students miss ho jaayenge
        // waise iske liye humne frontend pe required lga rkha h radio buttons pe but fir maybe koi dom manipulation krke aadha adhura data bhej bhi skta h
        
        const ids = Object.keys(combinedStatus); // creates a array of ids
        const allStudents = await Student.findAll({ // this will execute this -> SELECT * FROM Student WHERE id IN (1, 2, 3);
            where: { id: ids }
        });

        if (allStudents.length !== ids.length) {
            return res.status(400).json({ message: "Some students are invalid/missing" });
        }

        // Prepare attendance records and insert them
        for (const student of allStudents) {
            const status = combinedStatus[student.id]; // getting status for a particular single student
            
            if (status) {
                // Use Sequelize magic method to create attendance entry
                await student.createAttendance({
                    date: Date,
                    status: status
                });
            }
        }

        res.status(201).json({ message: "Attendance recorded successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

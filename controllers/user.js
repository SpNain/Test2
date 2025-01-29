const fs = require('fs').promises;
const userDetails = require('../models/userDetails');

exports.getFormPage = async(request,response,next)=>{
    try{
        response.sendFile('index.html',{root:'views/user'})
    }catch(err){
        console.log("error in getting form page", err);
    }
}

exports.addUserDetails = async(request,response,next)=>{
    try {
        console.log(request.body);
        const { name, email, phone, date } = request.body;
        console.log("add user details fxn");
        let userd = await userDetails.create({
            Name:name,
            Email:email,
            Phone:phone,
            Date:date
        })
        console.log(userd);
        response.redirect('/user/appointments');

    }catch(err){
        console.log("Error while adding the details of a new User",err);
        response.send('Duplicate Entry');
    }
}

exports.getAllAppointments = async(request,response,next)=>{
    try{
        const data = await userDetails.findAll();
        response.send(data);

    }catch(err){
        console.log("Error while fetching all users Details",err);
    }

}

exports.deleteUserDetails = async(request,response,next)=>{ 
    const id = request.params.id;
    try{
        await userDetails.destroy({
            where:{
                id : id
            }
        })
        response.redirect('/user/form');
    }catch(err){
        console.log("Error while deleting user Details with id : ",id,err)
    }
}

exports.editUserDetails = async(request,response,next)=>{
    const id = request.params.id;
    try {
        const userDetailsObj = await userDetails.findByPk(id);
        response.send(userDetailsObj);
    } catch (error) {
        console.log(error);
    }
}
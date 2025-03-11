const bcrypt = require("bcrypt");
const Charity = require("../models/charityModel");
const Project = require("../models/projectModel");
const jwtService = require("../services/jwtService");
const { sendEmail } = require("../services/emailService");
const { Op } = require("sequelize");


exports.postCharitySignup = async (req, res, next) => {
  const { name, email, password, mission, category, location } = req.body;

  try {
    const existingCharity = await Charity.findOne({ where: { email } });
    if (existingCharity) {
      return res.status(409).json({
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Charity.create({
      name,
      email,
      password: hashedPassword,
      mission,
      category,
      location,
    });

    res.status(200).json({ message: "Charity Created Successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postCharityLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const charity = await Charity.findOne({ where: { email } });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity doesn't exist!",
      });
    }

    if (charity.isApproved) {
      const isPasswordValid = await bcrypt.compare(password, charity.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Password incorrect!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Login successful!",
        token: jwtService.generateAccessToken(charity.id, charity.email),
      });
    } else {
      return res.status(401).json({
        success: false,
        message:
          "Charity isn't approved yet! Please wait. We will send you a mail after the approval.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: err,
    });
  }
};

exports.getCharityProfile = async (req, res, next) => {
  res.status(200).json({ charityInfo: req.charity });
};

exports.updateCharityProfile = async (req, res, next) => {
  try {
    const charityId = req.params.id;
    const { name, email, password, mission, category, location } = req.body;

    const existingCharity = await Charity.findOne({
      where: {
        email,
        id: { [Op.ne]: charityId }, // Check if email exists for a different charity
      },
    });

    if (existingCharity) {
      return res.status(409).json({
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Charity.update(
      {
        name,
        email,
        password: hashedPassword,
        mission,
        category,
        location,
      },
      {
        where: { id: charityId },
      }
    );

    res.status(200).json({ message: "Charity profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteCharityProfile = async (req, res, next) => {
  try {
    const charityId = req.params.id;
    await Charity.destroy({ where: { id: charityId } });
    res.status(200).json({ message: "Charity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, requiredFunds } = req.body;
    const charityId = req.charity.id;
    

    if (requiredFunds <= 0) {
      return res.status(400).json({
        success: false,
        message: "Required funds must be greater than 0!",
      });
    }

    const project = await Project.create({
      name,
      description,
      requiredFunds,
      CharityId: charityId,
    });

    res.status(201).json({ message: "Project created successfully!", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getProjectsList = async (req, res, next) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.rowsPerPage) || 10;
    const status = req.query.status;
    const charityId = req.charity.id;

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;
    const totalProjects = await Project.count({ where: {charityId} });

    const totalPages = Math.ceil(totalProjects / limit);

    let projects;
    if (status == "Active" || status == "Completed") {
      projects = await Project.findAll({
        where: { charityId, status: status },
        offset: offset,
        limit: limit,
      });
    }
    else {
      projects = await Project.findAll({
        where: {charityId},
        offset: offset,
        limit: limit,
      });
    }
    res.json({ projects: projects, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { name, description, requiredFunds } = req.body;

    if (requiredFunds <= 0) {
      return res.status(400).json({
        success: false,
        message: "Required funds must be greater than 0!",
      });
    }

    let status = "Active";
    const project = await Project.findOne({ where: { id: projectId } });

    if (project.raisedFunds >= requiredFunds) status = "Completed";

    await Project.update(
      {
        name,
        description,
        requiredFunds,
        status,
      },
      {
        where: { id: projectId },
      }
    );

    res.status(200).json({ message: "Project updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    await Project.destroy({ where: { id: projectId } });
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.sendEmailToDonors = async (req, res, next) => {
  try {
    const { subject, content } = req.body;
    
    const projectId = req.params.id;
    const { donors } = await Project.findOne({ where: { id: projectId } });

    const charityInfo = {
      name: req.charity.name,
    }

    const donorsInfo = {
      emails: donors.map((donor) => donor.email),
      subject: subject,
      content: content,
    }
    
    await sendEmail(charityInfo, donorsInfo);
    res.status(200).json({ message: "Email to donors sent successfully!" });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
}

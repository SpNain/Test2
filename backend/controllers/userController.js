const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Charity = require("../models/charityModel");
const Project = require("../models/projectModel");
const Order = require("../models/orderModel");
const Donation = require("../models/donationModel");
const jwtService = require("../services/jwtService");
const CashfreeService = require("../services/cashfreeService");
const { uploadFileToS3 } = require("../services/awsService");
const { sendEmail } = require("../services/emailService");
const { generatePDF } = require("../services/pdfService");
const { Op } = require("sequelize");

exports.postUserSignup = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(200).json({ message: "User Created Successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postUserLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    if (user.role === "user") {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Password incorrect!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Login successful!",
        token: jwtService.generateAccessToken(user.id, user.email, user.role),
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "User doesn't exist!",
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

exports.getUserProfile = async (req, res, next) => {
  res.status(200).json({ userInfo: req.user });
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: userId }, // Check if email exists for a different user
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.update(
      {
        name,
        email,
        password: hashedPassword,
      },
      {
        where: { id: userId },
      }
    );

    res.status(200).json({ message: "User profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.destroy({ where: { id: userId } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getCharitiesList = async (req, res, next) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.rowsPerPage) || 10;
    const filter = req.query.filter;
    const search = req.query.search;
    console.log(filter, search);

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;

    let totalCharities;
    if (filter == "String") {
      totalCharities = await Charity.count({
        where: {
          isApproved: true,
          [Op.or]: [
            { category: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } },
            { mission: { [Op.like]: `%${search}%` } },
          ],
        },
      });
    } else if (filter == "Category") {
      totalCharities = await Charity.count({
        where: {
          isApproved: true,
          category: { [Op.like]: `%${search}%` },
        },
      });
    } else if (filter == "Location") {
      totalCharities = await Charity.count({
        where: {
          isApproved: true,
          location: { [Op.like]: `%${search}%` },
        },
      });
    }

    const totalPages = Math.ceil(totalCharities / limit);

    let charities;
    if (filter == "String") {
      charities = await Charity.findAll({
        where: {
          isApproved: true,
          [Op.or]: [
            { category: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } },
            { mission: { [Op.like]: `%${search}%` } },
          ],
        },
        offset: offset,
        limit: limit,
      });
    } else if (filter == "Category") {
      charities = await Charity.findAll({
        where: {
          isApproved: true,
          category: { [Op.like]: `%${search}%` },
        },
        offset: offset,
        limit: limit,
      });
    } else if (filter == "Location") {
      charities = await Charity.findAll({
        where: {
          isApproved: true,
          location: { [Op.like]: `%${search}%` },
        },
        offset: offset,
        limit: limit,
      });
    }

    res.json({ charities: charities, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getCharityDetails = async (req, res, next) => {
  try {
    const charityId = req.params.id;
    const charity = await Charity.findOne({
      where: { id: charityId },
      include: [{ model: Project, where: { status: "Active" } }], // Include only active projects
    });
    res.status(200).json({ charityDetails: charity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { orderId, orderAmount, orderCurrency = "INR" } = req.body;

    const response = await CashfreeService.createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      req.user
    );

    if (response.data) {
      await req.user.createOrder({
        orderId: response.data.order_id,
        paymentId: response.data.payment_session_id,
        status: "PENDING",
      });

      res.status(200).json({
        orderId: response.data.order_id,
        paymentId: response.data.payment_session_id,
      });
    } else {
      res.status(500).json({ error: "Failed to create order" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderStatus = await CashfreeService.getPaymentStatus(orderId);

    res.status(200).json({ orderStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { orderId, status, projectId, charityId, donationAmount } = req.body;
    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ status });

    await updateData(projectId, charityId, donationAmount, order, req);

    return res.status(202).json({
      success: true,
      message: "Transaction Successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

async function updateData(projectId, charityId, donationAmount, order, req) {
  const project = await Project.findOne({ where: { id: projectId } });
  const charity = await Charity.findOne({ where: { id: charityId } });

  const updatedRaisedFunds = project.raisedFunds + donationAmount;
  let projectStatus = project.status;

  if (updatedRaisedFunds >= project.requiredFunds) {
    projectStatus = "Completed";
  }

  const donorsEmails = project.donors.map((donor) => donor.email);
  if (!donorsEmails.includes(req.user.email)) {
    project.donors.push({ "email": req.user.email });
  }

  await project.update({
    raisedFunds: updatedRaisedFunds,
    status: projectStatus,
    donors: project.donors,
  });

  const charityInfo = {
    name: charity.name,
  };

  const userInfo = {
    emails: [req.user.email],
    subject: "Thank you for your donation",
    content: `Dear ${req.user.name},\n\nThank you for your generous donation of ${donationAmount} to ${charity.name} for the project ${project.name}.\n\nBest regards,\n${charity.name}`,
  };

  await sendEmail(charityInfo, userInfo);

  const pdfBuffer = await generatePDF(
    charity,
    project,
    donationAmount,
    order.paymentId
  );

  const receiptUrl = await uploadFileToS3({
    originalname: "receipt.pdf",
    buffer: pdfBuffer,
    mimetype: "application/pdf",
  });

  await req.user.createDonation({
    paymentId: order.paymentId,
    charityName: charity.name,
    projectName: project.name,
    donationAmount: donationAmount,
    receiptUrl: receiptUrl,
  });
}


exports.getDonationHistory = async (req, res, next) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.rowsPerPage) || 10;

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;
    const totalDonations = await Donation.count({
      where: { userId: req.user.id },
    });

    const totalPages = Math.ceil(totalDonations / limit);

    const donations = await Donation.findAll({
      where: { userId: req.user.id },
      offset: offset,
      limit: limit,
    });
    res.json({ donations: donations, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
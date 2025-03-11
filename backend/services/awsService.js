const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Configure AWS SDK S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to upload file to S3
const uploadFileToS3 = async (file) => {
  try {
    if (!file) throw new Error("No file provided");

    const fileName = `"uploads"/${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    // Upload file to S3
    const uploadResponse = await s3.upload(params).promise();
    return uploadResponse.Location; // Returns the file URL
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

module.exports = { uploadFileToS3 };

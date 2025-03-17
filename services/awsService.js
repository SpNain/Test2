const AWS = require("aws-sdk");

exports.uploadToS3 = async (data, filename) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: "public-read",
    };
    const uploadResponse = await s3.upload(uploadParams).promise();
    return uploadResponse.Location;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

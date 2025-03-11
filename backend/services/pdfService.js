const PDFDocument = require("pdfkit");

exports.generatePDF = async (charity, project, donationAmount, paymentId) => {
  const doc = new PDFDocument();
  let buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  doc.text(`Receipt for Donation`, { align: "center" });
  doc.text(`Charity: ${charity.name}`);
  doc.text(`Project: ${project.name}`);
  doc.text(`Donation Amount: ${donationAmount}`);
  doc.text(`Payment ID: ${paymentId}`);
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on("error", reject);
  });
};

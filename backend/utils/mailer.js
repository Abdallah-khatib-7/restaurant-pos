const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendNewApplicationEmail = async (application) => {
  const mailOptions = {
    from: `"Restaurant POS" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `New Restaurant Application — ${application.restaurant_name}`,
    html: `
      <h2>New Application Received</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr><td><b>Owner Name</b></td><td>${application.owner_name}</td></tr>
        <tr><td><b>Owner Email</b></td><td>${application.owner_email}</td></tr>
        <tr><td><b>Owner Phone</b></td><td>${application.owner_phone}</td></tr>
        <tr><td><b>Restaurant Name</b></td><td>${application.restaurant_name}</td></tr>
        <tr><td><b>Branch</b></td><td>${application.branch_name || 'N/A'}</td></tr>
        <tr><td><b>Type</b></td><td>${application.restaurant_type}</td></tr>
        <tr><td><b>City</b></td><td>${application.city}</td></tr>
        <tr><td><b>Address</b></td><td>${application.address}</td></tr>
        <tr><td><b>Phone</b></td><td>${application.phone}</td></tr>
        <tr><td><b>Seating Capacity</b></td><td>${application.seating_capacity}</td></tr>
        <tr><td><b>Tables</b></td><td>${application.num_tables}</td></tr>
        <tr><td><b>Has Delivery</b></td><td>${application.has_delivery ? 'Yes' : 'No'}</td></tr>
        <tr><td><b>Has Shisha</b></td><td>${application.has_shisha ? 'Yes' : 'No'}</td></tr>
        <tr><td><b>Has Outdoor</b></td><td>${application.has_outdoor_seating ? 'Yes' : 'No'}</td></tr>
        <tr><td><b>Staff</b></td><td>Owners: ${application.num_owners} | Waiters: ${application.num_waiters} | Kitchen: ${application.num_kitchen} | Delivery: ${application.num_delivery}</td></tr>
        <tr><td><b>Total Employees</b></td><td>${application.total_employees}</td></tr>
        <tr><td><b>Pricing Tier</b></td><td>${application.pricing_tier}</td></tr>
        <tr><td><b>Quoted Price</b></td><td>$${application.quoted_price}</td></tr>
      </table>
      <br>
      <p>Login to your super admin panel to approve or reject this application.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendNewApplicationEmail };
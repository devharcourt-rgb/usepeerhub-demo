export const adminWelcomeEmailTemplate = ({
  firstName,
  lastName,
  otp,
  companyName = "PeerHub",
}: {
  firstName: string;
  lastName: string;
  otp: string;
  companyName?: string;
}) => {
  return `<!DOCTYPE html>
    <html lang="en">
        <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #010102;
            color: white;
            padding: 10px;
            text-align: center;
        }

        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }

        .footer {
            text-align: center;
            font-size: 0.8em;
            color: #777;
            margin-top: 20px;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #010102;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }

        .otp {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            background-color: #e8f4fd;
            border: 1px dashed #010102;
            border-radius: 5px;
            margin: 20px 0;
        }
        #logo{
            transform: translateY(20px) !important
        }
    </style>
    </head>
    <body>
    <div class="header">
     <img id="logo" src="https://res.cloudinary.com/dgn6edv1k/image/upload/v1730034876/social_2_pyfqro.jpg" width="50" height="50"/>
        <h1>Welcome to ${companyName} Admin!</h1>
    </div>
    <div class="content">
        <p>Hello ${firstName} ${lastName},</p>
        <p>Thank you for accepting your invite to ${companyName} Admin. We're excited to have you on board!</p>
        <p>To ensure the security of your account, please verify your email address using the following One-Time Password (OTP):</p>
        <div class="otp">${otp}</div>
        <p>This OTP will expire in 5 minutes. Please enter this code on the verification page to complete your account setup.</p>
       
        <p>If you didn't initiate this request, please ignore this email or contact our support team.</p>
        <p>We're looking forward to seeing you in action!</p>
        <p>Best regards,<br>The ${companyName} Team</p>
    </div>
    <div class="footer">
        <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
    </body>
    </html>`;
};

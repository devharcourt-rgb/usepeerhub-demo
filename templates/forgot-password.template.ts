export const forgotPasswordEmailTemplate = ({
  firstName,
  lastName,
  otp,
  id,
}: {
  firstName: string;
  lastName: string;
  otp: string;
  id: string;
}) => {
  return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Activity</title>
          <script src="https://kit.fontawesome.com/05a6f2a2fb.js" crossorigin="anonymous"></script>
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
     <img id="logo" src="https://res.cloudinary.com/dgn6edv1k/image/upload/v1789469138/logo-blue_twd5mt.svg" width="50" height="50"/>
        <h1>Forgot Password</h1>
    </div>
    <div class="content">
        <p>Hello ${firstName} ${lastName},</p>
        <p>We received a request to reset your password. If you did not request this, please ignore this email.</p>
        <p>To reset your password, use the otp below:</p>
        <p style="text-align: center;">
           <b style="font-size: 1.2rem">${otp}</b>
        </p>
        <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The PeerHub Team</p>
    </div>
    <div class="footer">
        <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
    </body>
      </html>`;
};

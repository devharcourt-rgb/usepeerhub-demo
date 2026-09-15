export const customerAccountCreationEmailTemplate = ({
  firstName,
  lastName,
  password,
  emailAddress,
  companyName = "PeerHub",
}: {
  firstName: string;
  lastName: string;
  password: string;
  emailAddress: string;
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
     <img id="logo" src="https://res.cloudinary.com/dgn6edv1k/image/upload/v1789469138/logo-blue_twd5mt.svg" width="50" height="50"/>
        <h1>Welcome to ${companyName}!</h1>
    </div>
    <div class="content">
        <p>Hello ${firstName} ${lastName}</p>
        <p>We trust this email finds you well. We wanted to notify you promptly that an account has been created for you on ${companyName}</p>

        <p>
       Here are your login credentials: <br />
       Email Address: ${emailAddress} <br />
       Password: ${password} <br />
        </p>


        <p>We look forward to working with you at ${companyName}</p>

       
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

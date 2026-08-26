export const discoTokenEmailTemplate = ({
  firstName,
  metertoken,
  companyName = "PeerHub",
}: {
  firstName: string;
  metertoken: string;
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
        <h1>Electricity Topup</h1>
    </div>
    <div class="content">
        <p>Hello ${firstName},</p>
        <p>
        We wanted to let you know that your electricity topup was successful.
        </p>

        <p>To access your token please check your app</p>

       
        
        <p>Thank you for choosing ${companyName}</p>
        
       
        <p>We're looking forward to seeing you in action!</p>
        <p>Best regards,<br>The ${companyName} Team</p>
    </div>
    <div class="footer">
        <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
    </body>
    </html>`;
};

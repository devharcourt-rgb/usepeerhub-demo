import { socialIconsHtml } from "./social-icons.template";

export const otpEmailTemplate = ({
  firstName,
  otp,
  companyName = "PeerHub",
}: {
  firstName: string;
  otp: string;
  companyName?: string;
}) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <style>
        /* Gmail strips external stylesheet loading, so this only takes
           effect in clients that honor it (Apple Mail, some Outlook.com /
           Android clients) — Arial is the fallback everywhere else. */
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

        body {
            font-family: 'Roboto', Arial, sans-serif;
            line-height: 1.6;
            background-color: #f2f2f2;
            margin: 0;
            padding: 20px;
        }

        .card {
            max-width: 480px;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
        }

        /* The source logo file has a lot of blank space baked in below the
           mark itself, which only gets bigger as the image is scaled up.
           Cropping the wrapper to the mark's actual height (rather than
           the full 120px image box) is what actually closes the gap —
           margin/transform between the two elements can't fix whitespace
           that lives inside the image. */
        .logo-wrap {
            text-align: center;
            height: 74px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .card-header {
            background-color: #2C12F7;
            padding: 32px 24px;
            text-align: center;
        }

        .card-header h1 {
            color: #ffffff;
            font-size: 22px;
            margin: 0;
        }

        .card-body {
            background-color: #ffffff;
            color: #000000;
            padding: 32px 24px;
        }

        .otp {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 4px;
            padding: 14px;
            background-color: #f2f0fe;
            border: 1px dashed #2C12F7;
            border-radius: 8px;
            margin: 20px 0;
            color: #000000;
        }

        .footer {
            text-align: center;
            font-size: 0.8em;
            color: #777;
            margin-top: 20px;
        }

        .social-icons {
            margin-top: 14px;
        }
    </style>
    </head>
    <body>
    <div class="logo-wrap">
        <img id="logo" src="https://res.cloudinary.com/dgn6edv1k/image/upload/v1789469138/logo-blue_twd5mt.svg" width="120" height="120" alt="${companyName}" />
    </div>
    <div class="card">
        <div class="card-header">
            <h1>Verify Your Email</h1>
        </div>
        <div class="card-body">
            <p>Hey ${firstName},</p>
            <p>Use the code below to verify your email address. It expires in 10 minutes.</p>
            <div class="otp">${otp}</div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br>The ${companyName} Team</p>
        </div>
    </div>
    <div class="footer">
        <p>This is an automated message, please do not reply directly to this email.</p>
        ${socialIconsHtml()}
    </div>
    </body>
    </html>`;
};

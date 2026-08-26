export const debitEmailTemplate = ({
  from,
  amount,
  to,
}: {
  from: string;
  amount: string;
  to: string;
}) => {
  return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Activity</title>
          <script src="https://kit.fontawesome.com/05a6f2a2fb.js" crossorigin="anonymous"></script>
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
       <img id="logo" src="https://res.cloudinary.com/dgn6edv1k/image/upload/v1730034876/social_2_pyfqro.jpg" width="50" height="50"/>
        <h1>Debit Alert</h1>
    </div>
  
          <main class="content">
              <p>Hello ${from},</p>
              <p>
    
              Your transfer of ₦${amount} to ${to} was successful. Enjoy convenient spending and financial freedom.
              </p>

                  <p>
                      Best Regards,<br>Team BlowApp
                  </p>
          <div class="footer">
              <hr />
              <p>Follow us on:</p>
      
              <div class="icons">
                  <a href="#">
                      <i class="fa-brands fa-square-facebook"></i>
                  </a>
                  <a href="#">
                      <i class="fa-brands fa-square-instagram"></i>
                  </a>
                  <a href="#">
                      <i class="fa-brands fa-linkedin"></i>
                  </a>
                  <a href="#">
                      <i class="fa-brands fa-square-twitter"></i>
                  </a>
              </div>
          </div>
          </main>
      </body>
      </html>`;
};

import rateLimit from "express-rate-limit";

// Define the rate limit for the OTP endpoint
export const requestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 5000, // Limit each IP to 5000 requests per windowMs
  message:
    "Too many OTP requests from this IP, please try again after 5 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

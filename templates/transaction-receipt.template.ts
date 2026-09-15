export const transactionReceiptTemplate = () => {
  return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Transaction Receipt</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }

    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #ddd;
      padding: 30px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .receipt-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
      margin-bottom: 20px;
    }

    .logo-container {
      text-align: center;
      margin-bottom: 15px;
    }

    .logo {
      width: 80px;
      height: 80px;
    }

    .receipt-title {
      font-size: 24px;
      margin: 0;
      color: #2c3e50;
    }

    .transaction-id {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 5px;
    }

    .receipt-body {
      margin-bottom: 30px;
    }

    .transaction-details {
      width: 100%;
      border-collapse: collapse;
    }

    .transaction-details td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }

    .label {
      font-weight: bold;
      width: 40%;
    }

    .value {
      width: 60%;
    }

    .amount {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
    }

    .receipt-footer {
      text-align: center;
      font-size: 14px;
      color: #7f8c8d;
      padding-top: 20px;
      border-top: 2px solid #eee;
    }

    .status-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }

    .status-completed {
      background-color: #dff0d8;
      color: #3c763d;
    }

    .status-pending {
      background-color: #fcf8e3;
      color: #8a6d3b;
    }

    .status-failed {
      background-color: #f2dede;
      color: #a94442;
    }
  </style>
</head>

<body>
  <div class="receipt-container">
    <div class="receipt-header">
      <div class="logo-container">
        <img class="logo" src="https://res.cloudinary.com/dgn6edv1k/image/upload/v1789469138/logo-blue_twd5mt.svg"
          alt="Company Logo">
      </div>
      <h1 class="receipt-title">Transaction Receipt</h1>
      <div class="transaction-id">{{transactionId}}</div>
    </div>

    <div class="receipt-body">
      <table class="transaction-details">
        <tr>
          <td class="label">Transaction Type:</td>
          <td class="value">{{type}}</td>
        </tr>
        <tr>
          <td class="label">Amount:</td>
          <td class="value amount">{{amount}}</td>
        </tr>
        <tr>
          <td class="label">Currency:</td>
          <td class="value">{{currency}}</td>
        </tr>
        <tr>
          <td class="label">Date:</td>
          <td class="value">{{date}}</td>
        </tr>
        <tr>
          <td class="label">Status:</td>
          <td class="value">
            <span class="status-badge status-{{status}}">{{status}}</span>
          </td>
        </tr>
      </table>
    </div>

    <div class="receipt-footer">
      <p>Thank you for your transaction.</p>
      <p>This receipt was automatically generated on {{date}}.</p>
    </div>
  </div>
</body>

</html>
`;
};

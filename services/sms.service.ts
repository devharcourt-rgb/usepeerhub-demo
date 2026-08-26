
import process from 'process';

/**
 * Send sms using Termii network
 * @param to
 * @param body
 */
export const smsService = async (to: string, body: string) => {
  const postData = {
    to,
    from: "Blow Pay",
    body,
    type: "plain",
    api_token: process.env.BULK_SMS_KEY,
    channel: "generic",
  };

  try {
    const response = await fetch(
      "https://www.bulksmsnigeria.com/api/v2/sms",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      }
    );

    const data = await response.text();
    return data;
  } catch (error: any) {
    console.error("Failed Sending SMS", error);
    throw error;
  }
};

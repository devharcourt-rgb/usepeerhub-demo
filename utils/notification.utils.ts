// src/services/notification.service.ts
import { firebaseAdmin } from "../config/database-firebase";
import DeviceToken, { IDeviceToken } from "../models/device-token.model";

export class NotificationService {
  private static instance: NotificationService;
  //   private expo: Expo;

  private constructor() {
    // this.expo = new Expo();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Register a device token for a user
   */
  public async registerDeviceToken(
    user_id: string,
    token: string,
    platform: string,
    source: string
  ): Promise<void> {
    try {
      // Check if token already exists
      const existingToken = await DeviceToken.findOne({ token });

      if (existingToken) {
        await DeviceToken.updateOne({ token }, { user_id, platform, source });
      } else {
        await DeviceToken.create({ user_id, token, platform, source });
      }
    } catch (error) {
      console.error("Error registering device token:", error);
      throw error;
    }
  }

  /**
   * Remove a device token
   */
  public async removeDeviceToken(token: string): Promise<void> {
    try {
      await DeviceToken.deleteOne({ token });
    } catch (error) {
      console.error("Error removing device token:", error);
      throw error;
    }
  }

  // /**
  //  * Send notification to a single device
  //  */
  // public async sendToDevice(
  //   token: string,
  //   title: string,
  //   body: string,
  //   data?: any
  // ): Promise<void> {
  //   try {
  //     const message = {
  //       token,
  //       notification: {
  //         title,
  //         body,
  //       },
  //       data: data || {},
  //     };

  //     const response = await firebaseAdmin.messaging().send(message);
  //     console.log('Successfully sent message:', response);
  //   } catch (error: any) {
  //     console.error('Error sending message:', error);

  //     // If token is invalid/not registered, remove it from our DB
  //     if (
  //       error.code === 'messaging/invalid-registration-token' ||
  //       error.code === 'messaging/registration-token-not-registered'
  //     ) {
  //       console.log(`Removing invalid token: ${token}`);
  //       await this.removeDeviceToken(token);
  //     }

  //     throw error;
  //   }
  // }

  public async sendToDevice(
    device: IDeviceToken,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      if (/**device.source === 'expo' */ false) {
        // Send via Expo push notification service
        // if (!Expo.isExpoPushToken(device.token)) {
        //   throw new Error('Invalid Expo push token');
        // }
        // const messages: ExpoPushMessage[] = [{
        //   to: device.token,
        //   sound: 'default',
        //   title,
        //   body,
        //   data: data || {},
        // }];
        // const chunks = this.expo.chunkPushNotifications(messages);
        // for (const chunk of chunks) {
        //   const receipts = await this.expo.sendPushNotificationsAsync(chunk);
        // }
      } else {
        // Send via Firebase
        const message = {
          token: device.token,
          notification: {
            title,
            body,
            image:
              "https://res.cloudinary.com/dgn6edv1k/image/upload/v1730034876/social_2_pyfqro.jpg",
          },
          data: data || {},
        };
        const response = await firebaseAdmin.messaging().send(message);
        console.log("Successfully sent Firebase message:", response);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      if (device.source !== "expo") {
        if (
          error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered"
        ) {
          console.log(`Removing invalid token: ${device.token}`);
          await this.removeDeviceToken(device.token);
        }
      }
      // throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  public async sendToDevices(
    devices: IDeviceToken[],
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      if (devices.length === 0) return;
      for (const device of devices) {
        await this.sendToDevice(device, title, body, data);
      }
    } catch (error) {
      console.error("Error sending multicast message:", error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  public async sendToAll({
    title,
    message,
  }: {
    title: string;
    message: string;
  }): Promise<void> {
    try {
      const devices = await DeviceToken.find({ source: "firebase" });

      for (const device of devices) {
        await this.sendToDevice(device, title, message, {});
      }
    } catch (error) {
      console.error("Error sending multicast message:", error);
      throw error;
    }
  }

  /**
   * Send notification to all devices of a user
   */
  public async sendToUser(
    user_id: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      const devices = await DeviceToken.find({ user_id });
      if (devices.length === 0) return;
      await this.sendToDevices(devices, title, body, data);
    } catch (error) {
      console.error("Error sending to user:", error);
      throw error;
    }
  }
  /**
   * Find User Device
   */
  public async findDevice(
    token: string,
    user_id: any
  ): Promise<IDeviceToken | null> {
    try {
      const device = await DeviceToken.findOne({ token, user_id });
      return device;
    } catch (error) {
      console.error("Error finding to user:", error);
      throw error;
    }
  }
}

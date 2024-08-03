import axios from "axios";

import config from "../config.js";

const {
  baseURL,
  bkash_user,
  bkash_password,
  app_key,
  app_secret,
  callbackURL,
} = config;

const bKashService = {
  async getAccessToken() {
    try {
      const requestData = {
        app_key,
        app_secret,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          username: bkash_user,
          password: bkash_password,
        },
      };
      const response = await axios.post(
        `${baseURL}/tokenized/checkout/token/grant`,
        requestData,
        config
      );
      return [response.data, null];
    } catch (error) {
      console.error("Error getting access token:", error?.message);
      return [null, error];
    }
  },

  async createPayment({
    token,
    userId,
    amount,
    InvoiceCount,
    currency = "BDT",
    intent = "sale",
  }) {
    try {
      const requestData = {
        mode: "0011",
        payerReference: userId,
        callbackURL,
        amount,
        currency,
        intent,
        merchantInvoiceNumber: `INV-${InvoiceCount + 1}`,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          username: bkash_user,
          password: bkash_password,
          "x-app-key": app_key,
          authorization: token,
        },
      };

      const response = await axios.post(
        `${baseURL}/tokenized/checkout/create`,
        requestData,
        config
      );
      return [response.data, null];
    } catch (error) {
      console.error("Error creating payment:", error);
      return [null, error];
    }
  },

  async checkBalance({ token }) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-app-key": app_key,
          authorization: token,
        },
      };

      const response = await axios.get(
        `${baseURL}/checkout/payment/organizationBalance`,
        config
      );

      console.log(response.data);
      return [response.data, null];
    } catch (error) {
      console.error("Error creating payment:", error);
      return [null, error];
    }
  },

  async createDisburse({
    token,
    amount,
    InvoiceCount,
    currency = "BDT",
    receiverMSISDN,
  }) {
    try {
      const requestData = {
        amount,
        currency,
        receiverMSISDN,
        merchantInvoiceNumber: `INV-DISBURSE-${InvoiceCount + 1}`,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-app-key": app_key,
          authorization: token,
        },
      };

      const response = await axios.post(
        `${baseURL}/checkout/payment/b2cPayment`,
        requestData,
        config
      );
      console.log({ response });
      return [response.data, null];
    } catch (error) {
      console.error("Error creating payment:", error);
      return [null, error];
    }
  },
};

export default bKashService;

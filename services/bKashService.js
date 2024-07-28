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
        merchantInvoiceNumber: userId,
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
};

export default bKashService;

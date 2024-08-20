import axios from "axios";

const GoogleService = {
  async verify({ accessToken }) {
    try {
      const { data } = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
        { headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` } }
      );

      return [data, null];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("GoogleService verify", error);

      return [null, error];
    }
  },
};

export default GoogleService;

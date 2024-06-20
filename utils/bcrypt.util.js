import bcrypt from "bcrypt";

const Bcrypt = {
  async getHash({ data, saltRounds = 10 }) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(data, salt);

    return hashed;
  },

  async compare(data = "", encrypted = "") {
    const isMatched = await bcrypt.compare(data, encrypted);
    return isMatched;
  },
};

export default Bcrypt;

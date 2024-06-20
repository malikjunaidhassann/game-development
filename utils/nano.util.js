import { customAlphabet } from "nanoid";

const Nano = {
  getCode({ size = 6, alphabet = "1234567890" }) {
    return customAlphabet(alphabet, size)();
  },
};

export default Nano;

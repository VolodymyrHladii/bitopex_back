import { sign } from "jsonwebtoken";

export const generateToken = (id, email) => {
  try {
    return sign({ id, email }, process.env.JWT_SECRET_KEY ?? "", { expiresIn: "1d" });
  } catch (e) {
    return null;
  }
};

import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (
  firstname: string,
  lastname: string,
  email: string,
  password: string,
) => {
  if (!email.endsWith("@myges.fr")) throw new Error("L'email doit être un email GES");
  const user = await User.findOne({ email });
  if (user) throw new Error("Utilisateur déjà existant");
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstname,
    lastname,
    email,
    role: "user",
    password: hashedPassword,
  });

  const userCreated = await newUser.save();

  const token = jwt.sign(
    { id: userCreated._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );

  return { token, user: userCreated };
};

const login = async (email: string, password: string) => {
  const findUser = await User.findOne({ email });
  if (!findUser) throw new Error("Utilisateur non trouvé");

  const isMatch = await bcrypt.compare(password, findUser.password);
  if (!isMatch) throw new Error("Identifiants invalides");

  const token = jwt.sign(
    { id: findUser._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );
  return { token, user: findUser };
};

export { register, login };

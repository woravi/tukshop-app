import connect from "@/utils/config/dbConnection";
import User from "@/utils/models/User.js";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcryptjs from "bcryptjs";
import { isAdminRole } from "@/lib/role-authority.mjs";

const DEFAULT_PROFILE_IMAGE =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

async function createUser(email, password, name) {
  const hashedPassword = await bcryptjs.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    profileImage: DEFAULT_PROFILE_IMAGE,
    role: 'customer',
    admin: false,
  });
  return await newUser.save();
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password, name, isRegistering } = credentials;
        try {
          await connect();
          let user = await User.findOne({ email }).select("+password");
          if (isRegistering) {
            if (user) {
              throw new Error("User is already registered");
            }
            user = await createUser(email, password, name);
          } else {
            if (!user) {
              return null;
            }
            const passwordMatch = await bcryptjs.compare(
              password,
              user.password
            );
            if (!passwordMatch) {
              return null;
            }
          }

          //ensure user has profile image
          if (!user.profileImage) {
            user.profileImage = DEFAULT_PROFILE_IMAGE;
            await user.save();
          }
          return user;
        } catch (error) {
          console.log("Error at api/nextauth:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          const { email, name, image } = user;
          await connect();
          let foundUser = await User.findOne({ email });

          if (!foundUser) {
            const newUser = new User({
              email,
              name,
              profileImage: image || DEFAULT_PROFILE_IMAGE,
              role: 'customer',
              admin: false,
            });
            foundUser = await newUser.save();
          } else if (
            !foundUser.profileImage ||
            foundUser.profileImage === DEFAULT_PROFILE_IMAGE
          ) {
            foundUser.profileImage = image || DEFAULT_PROFILE_IMAGE;
            await foundUser.save();
          }

          user._id = foundUser._id.toString();
          user.email = foundUser.email;
          user.name = foundUser.name;
          user.notificationPreferences = foundUser.notificationPreferences;
          user.role = foundUser.role;
          user.admin = isAdminRole(foundUser.role);
          user.profileImage = foundUser.profileImage;

          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token._id = user._id.toString();
        token.email = user.email;
        token.name = user.name;
        token.notificationPreferences = user.notificationPreferences;
        token.role = user.role;
        token.admin = isAdminRole(user.role);
        token.profileImage = user.profileImage;
      }
      // Client update payloads are not an identity or authorization source.
      return token;
    },
    async session({ session, token }) {
      if (!token?._id || !/^[1-9]\d*$/.test(String(token._id))) {
        session.user = null;
        return session;
      }
      await connect();
      const currentUser = await User.findById(token._id);
      if (!currentUser) {
        session.user = null;
        return session;
      }
      session.user = {
        _id: String(currentUser._id),
        email: currentUser.email,
        name: currentUser.name,
        notificationPreferences: currentUser.notificationPreferences,
        role: currentUser.role,
        admin: isAdminRole(currentUser.role),
        profileImage: currentUser.profileImage || DEFAULT_PROFILE_IMAGE,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/"
  }
};

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};

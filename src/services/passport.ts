// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import User from "../models/user";

// // Configure Google OAuth strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/v1/auth/google/callback",
//       scope: ["profile", "email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Find or create a user based on the Google profile information
//         let user = await User.findOne({ googleId: profile.id });

//         if (!user) {
//           // If the user doesn't exist, create a new user
//           user = new User({
//             googleId: profile.id,
//             username: profile.displayName,
//             email: profile.emails[0].value,
//             // You can set additional fields here based on the profile data
//           });
//           await user.save();
//         }

//         // Return the user object
//         return done(null, user);
//       } catch (error) {
//         return done(error, false);
//       }
//     }
//   )
// );

// // Serialize and deserialize user (if needed)
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   // Find user by ID and return it
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// @desc    Google OAuth Callback
// @route   GET /auth/google/callback
// @access  Public
// export const googleCallback = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   passport.authenticate("google", { session: false }, (err, user) => {
//     if (err) {
//       // Handle error
//       return next(err);
//     }

//     if (!user) {
//       // Handle user not found
//       return res.status(401).json({ message: "Authentication failed" });
//     }

//     // Generate a JWT token for the user and send it back as a response
//     // const token = user.getSignedJwtToken();
//     res.json({
//       success: true,
//       data: {
//         username: user.username,
//         email: user.email,
//         token: user.getSignedJwtToken(),
//       },
//     });
//   })(req, res, next);
// };

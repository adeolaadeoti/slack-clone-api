import { Request, Response, NextFunction } from 'express'
import User from '../models/user'
import sendEmail from '../helpers/sendEmail'
import crypto from 'crypto'
import { verificationHtml } from '../html/confirmation-code-email'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create a user based on the Google profile information
        let user = await User.findOne({ googleId: profile.id })
        if (!user) {
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
          })
          await user.save()
        }

        return done(null, user)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      data: {
        name: 'Please provide your email address',
      },
    })
  }

  const emailExist = await User.findOne({ email })

  if (emailExist) {
    return res.status(400).json({
      success: false,
      data: {
        name: 'User already exists',
      },
    })
  }

  const user = await User.create({
    username,
    email,
  })
  try {
    const verificationToken = user.getVerificationCode()
    await user.save()
    sendEmail(
      email,
      'Slack confirmation code',
      verificationHtml(verificationToken)
    )

    res.status(201).json({
      success: true,
      data: {
        name: 'Verification token sent to email',
      },
    })
  } catch (err) {
    user.loginVerificationCode = undefined
    user.loginVerificationCodeExpires = undefined
    await user.save({ validateBeforeSave: false })
    next(err)
  }
}

// @desc    Signin user
// @route   POST /api/v1/auth/signin
// @access  Public
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      data: {
        name: 'Please provide your email address',
      },
    })
  }

  const user = await User.findOne({ email })

  if (!user) {
    return res.status(400).json({
      success: false,
      data: {
        name: "User doesn't exist",
      },
    })
  }

  try {
    const verificationToken = user.getVerificationCode()
    await user.save()

    sendEmail(
      email,
      'Slack confirmation code',
      verificationHtml(verificationToken)
    )

    res.status(201).json({
      success: true,
      data: {
        name: 'Verification token sent to email',
      },
    })
  } catch (err) {
    user.loginVerificationCode = undefined
    user.loginVerificationCodeExpires = undefined
    await user.save({ validateBeforeSave: false })
    next(err)
  }
}

// @desc    Verify user
// @route   POST /api/v1/auth/verify
// @access  Public
export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.loginVerificationCode) {
      return res.status(400).json({
        success: false,
        data: {
          name: 'Please provide verification token',
        },
      })
    }
    // Get hashed token
    const loginVerificationCode = crypto
      .createHash('sha256')
      .update(req.body.loginVerificationCode)
      .digest('hex')

    const user = await User.findOne({
      loginVerificationCode,
      loginVerificationCodeExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        data: {
          name: 'Invalid verification token',
        },
      })
    }

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        token: user.getSignedJwtToken(),
      },
    })

    user.loginVerificationCode = undefined
    user.loginVerificationCodeExpires = undefined
    await user.save({ validateBeforeSave: false })
  } catch (err) {
    next(err)
  }
}

// @desc    Google OAuth Callback
// @route   GET /auth/google/callback
// @access  Public
export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', (err, user) => {
    if (err) {
      // Handle error
      return next(err)
    }

    if (!user) {
      // Handle user not found
      return res.status(401).json({ message: 'Authentication failed' })
    }

    const token = user.getSignedJwtToken()

    res.redirect(
      `${process.env.CLIENT_URL}?token=${token}&email=${user.email}&username=${user.username}`
    )
  })(req, res, next)
}

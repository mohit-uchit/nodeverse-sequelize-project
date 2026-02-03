const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('./models/user/user.model');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔍 Google Profile:', profile.id, profile.displayName);
        console.log('📧 Email:', profile.emails?.[0]?.value);

        // Validate profile data
        if (!profile.emails || profile.emails.length === 0) {
          console.error('❌ No email in profile');
          return done(new Error('Email not provided by Google'), null);
        }

        let user = await User.findOne({ googleId: profile.id });
        console.log('📊 User found:', !!user);

        if (!user) {
          console.log('👤 Creating new user...');
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value || null,
            lastLogin: new Date(),
          });
          console.log('✅ User created:', user._id);
        } else {
          user.lastLogin = new Date();
          await user.save();
          console.log('✅ User updated');
        }

        return done(null, user);
      } catch (error) {
        console.error('❌ Strategy error:', error.message);
        console.error('Stack:', error.stack);
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log('🔐 Serializing user:', user._id);
  // Store the entire user object, not just the ID
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('🔓 Deserializing user ID:', id);
    const user = await User.findById(id);
    if (user) {
      console.log('✅ User deserialized:', user.email);
      done(null, user);
    } else {
      console.warn('⚠️  User not found:', id);
      done(null, null);
    }
  } catch (error) {
    console.error('❌ Deserialize error:', error.message);
    done(error, null);
  }
});

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: config.GOOGLE_AUTH.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_AUTH.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_AUTH.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
      accessType: 'offline',
      prompt: 'consent', // Har doim refresh token olish uchun
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      fullName: `${name?.givenName || ''} ${name?.familyName || ''}`,
      imageUrl: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };

    console.log(user)

    done(null, user);
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: config.GOOGLE_AUTH.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_AUTH.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_AUTH.GOOGLE_CALBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      email: profile.emails?.[0].value,
      fullName: `${profile.name?.givenName} ${profile.name?.familyName}`,
      imageUrl: profile.photos?.[0].value,
      googleId: profile.id,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
    };
  }
}

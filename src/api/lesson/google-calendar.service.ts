import { google } from 'googleapis';
import { config } from 'src/config';
import { Teacher } from 'src/core/entity/teacher.entity';
import { UnauthorizedException } from '@nestjs/common';

export class GoogleCalendarService {
  async getClient(teacher: Teacher) {
    const oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_AUTH.GOOGLE_CLIENT_ID,
      config.GOOGLE_AUTH.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_AUTH.GOOGLE_CALLBACK_URL,
    );

    if (!teacher.googleRefreshToken) {
      throw new UnauthorizedException(
        'Google Refresh Token topilmadi. Qaytadan tizimga kiring.',
      );
    }

    oauth2Client.setCredentials({
      access_token: teacher.googleAccessToken,
      refresh_token: teacher.googleRefreshToken,
    });

    return google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });
  }
}

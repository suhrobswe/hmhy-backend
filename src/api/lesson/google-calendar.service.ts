import { google } from 'googleapis';
import { config } from 'src/config';
import { Teacher } from 'src/core/entity/teacher.entity';

export class GoogleCalendarService {
  getClient(teacher: Teacher) {
    const oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_AUTH.GOOGLE_CLIENT_ID,
      config.GOOGLE_AUTH.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_AUTH.GOOGLE_CALLBACK_URL,
    );

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

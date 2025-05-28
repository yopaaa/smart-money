import axios from 'axios';
import * as AuthSession from 'expo-auth-session';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'your.app:/redirect', // untuk build native
  useProxy: true, // gunakan proxy Expo untuk testing
});

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const signInWithGoogle = async () => {
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=token` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPES.join(' '))}`;

  const result = await AuthSession.startAsync({ authUrl });

  if (result.type === 'success') {
    return result.params.access_token;
  } else {
    throw new Error('Login dibatalkan');
  }
};

export const uploadToGoogleDrive = async (accessToken, fileName, fileContent) => {
  const metadata = {
    name: fileName,
    mimeType: 'application/octet-stream',
  };

  const boundary = 'foo_bar_baz';
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n` +
    `${fileContent}\r\n--${boundary}--`;

  const response = await axios.post(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
    }
  );

  return response.data;
};

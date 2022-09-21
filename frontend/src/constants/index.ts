import config from "../config";

export const OAUTH2_REDIRECT_URI = config.redirectUri;

export const GOOGLE_AUTH_URL = config.apiBaseUrl + "/oauth2/authorize/google?redirect_uri=" + OAUTH2_REDIRECT_URI;

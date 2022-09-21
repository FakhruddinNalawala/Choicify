import prod from "./prod";
import dev from "./dev";

let config: {
  redirectUri: string,
  apiBaseUrl: string
};
if (import.meta.env.PROD) {
  config = prod;
} else {
  config = dev;
}

export default config;

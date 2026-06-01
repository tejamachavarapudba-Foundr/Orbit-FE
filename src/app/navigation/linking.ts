import { LinkingOptions } from "@react-navigation/native";

import { RootStackParamList } from "@/app/navigation/types";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["startuphouze://", "https://startuphouze.com"],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: "",
          Login: "login",
          Register: "register",
          ForgotPassword: "forgot-password"
        }
      },
      Main: {
        screens: {
          Home: "home",
          Messages: "messages",
          Projects: "projects",
          Jobs: "jobs",
          Events: "events",
          Search: "search",
          Admin: "admin",
          Discover: "discover",
          Network: "network",
          Profile: "profile"
        }
      }
    }
  }
};

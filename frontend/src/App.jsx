import { Admin, Resource } from "react-admin";

import NotFound from "./NotFound";
import configs from "./pages/configs";
import deviceTokens from "./pages/deviceTokens";
import iaps from "./pages/iaps";
import users from "./pages/users";
import addUploadFeature from "./utils/addUploadFeature";
import authProvider from "./utils/authProvider";
import httpClient from "./utils/httpClient";
import restProvider from "./utils/restProvider";

const dataProvider = restProvider("/api/v1", httpClient);
const uploadCapableDataProvider = addUploadFeature(dataProvider);

const App = () => (
  <Admin
    dataProvider={uploadCapableDataProvider}
    authProvider={authProvider}
    catchAll={NotFound}
  >
    <Resource name="iaps" {...iaps} options={{ label: "In App Purchase" }} />
    <Resource
      name="device-tokens"
      {...deviceTokens}
      options={{ label: "Device Tokens" }}
    />
    <Resource name="users" {...users} />
    <Resource name="configs" {...configs} />
  </Admin>
);

export default App;

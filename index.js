const path = require("path");
const fs = require("fs");

module.exports = (dir = ".") => ({
  name: "env",
  setup() {
    function _findEnvFile(dir) {
      if (!fs.existsSync(dir)) return false;
      let filePath = `${dir}/.env`;
      if (fs.existsSync(filePath)) {
        return filePath;
      } else {
        return _findEnvFile(path.resolve(dir, "../"));
      }
    }

    const data = await fs.promises.readFile(_findEnvFile(dir), "utf8");
    const buf = Buffer.from(data);
    const env = require("dotenv").parse(buf);

    Object.assign(process.env, env);
  },
});

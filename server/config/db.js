import mongoose from "mongoose";
import colors from "colors";
import dns from "dns";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("Error in MongoDB: MONGO_URI is not defined in environment variables".bgRed.white);
    process.exit(1);
  }

  const isSrvUri = mongoUri.startsWith("mongodb+srv://");

  // Allow explicit DNS override from env when local resolver has issues.
  const configuredDnsServers = (process.env.DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (configuredDnsServers.length > 0) {
    dns.setServers(configuredDnsServers);
    console.log(`Using custom DNS servers: ${configuredDnsServers.join(", ")}`.bgBlue.white);

    // dns.setServers() only affects dns.resolve*() (used for the SRV lookup).
    // dns.lookup() -- used internally by the driver/TLS layer to resolve each
    // shard hostname to an IP -- always falls back to the OS resolver via
    // getaddrinfo and ignores setServers(). Patch it to go through resolve4()
    // instead so shard hostnames also use the configured DNS servers.
    const originalLookup = dns.lookup.bind(dns);
    dns.lookup = (hostname, options, callback) => {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else if (typeof options === "number") {
        options = { family: options };
      }

      dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          originalLookup(hostname, options, callback);
          return;
        }

        if (options.all) {
          callback(
            null,
            addresses.map((address) => ({ address, family: 4 }))
          );
          return;
        }

        callback(null, addresses[0], 4);
      });
    };
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(
        `Connected to MongoDB Database: ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    const isSrvDnsFailure =
      isSrvUri && (error.code === "EBADRESP" || /querySrv|EBADRESP/i.test(error.message));

    if (isSrvDnsFailure && configuredDnsServers.length === 0) {
      const publicDnsServers = ["1.1.1.1", "8.8.8.8"];

      try {
        dns.setServers(publicDnsServers);
        console.log("Retrying MongoDB connection with public DNS servers...".bgYellow.black);

        const conn = await mongoose.connect(mongoUri);
        console.log(
          `Connected to MongoDB Database: ${conn.connection.host}`.bgMagenta.white
        );
        return;
      } catch (retryError) {
        console.error(
          `Error in MongoDB after DNS fallback: ${retryError.message}`.bgRed.white
        );
        process.exit(1);
      }
    }

    console.error(`Error in MongoDB: ${error.message}`.bgRed.white);
    process.exit(1); // Stop server if DB fails
  }
};

export default connectDB;
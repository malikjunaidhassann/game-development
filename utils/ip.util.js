import requestIP from "request-ip";

const IP = {
  getIP(req) {
    const ip = req.headers["x-real_ip"] || requestIP.getClientIp(req) || "";
    return ip;
  },
};

export default IP;

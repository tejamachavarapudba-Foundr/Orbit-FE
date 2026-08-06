import axios from "axios";

export async function testApi() {
  try {
    const res = await axios.post(
      "https://foundr-production.up.railway.app/api/auth/login",
      {
        email: "investor12@gmail.com",
        password: "YOUR_PASSWORD"
      }
    );

    console.log("SUCCESS", res.data);
  } catch (e: any) {
    console.log("FAILED");
    console.log(e.message);
    console.log(e.response?.status);
    console.log(e.response?.data);
  }
}
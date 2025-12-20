// controllers/authController.js
import authService from "../services/authService.js";

class AuthController {
  async signup(req, res) {
    try {
      const result = await authService.signup(req.body);
      res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }

  async logout(req, res) {
    try {
      const result = await authService.logout();
      res.status(result.status).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Server error during logout",
      });
    }
  }


  //for forget password section

  async checkEmail(req, res) {
    try {
      const { email } = req.body;

      // Call the service
      const result = await authService.checkEmail(email);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  //verify otp
  async verifyOTP(req, res) {
    try {
      const { otp } = req.body;
      const result = await authService.verifyOTP( otp);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  //setnewpassword
   async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
    //  console.log(email);
      const result = await authService.resetPassword(email, newPassword);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }


}





export default new AuthController();

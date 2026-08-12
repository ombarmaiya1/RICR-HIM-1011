import sendEmail from "../config/email.config.js";

 const SendOTPEmail = async (email, otp) => {
  try {
    const subject = "Your OTP Code";
    const message = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Dabba - Password Reset OTP</title>
</head>

<body style="margin:0;padding:0;background-color:#EFE8D8;font-family:'Courier New',Courier,monospace;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFE8D8;padding:40px 15px;">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#F7F2E6;border:1px solid #D6CBAE;">

          <!-- Perforated ticket edge (top) -->
          <tr>
            <td style="line-height:0;font-size:0;">
              <div style="height:12px;background-image:radial-gradient(circle at 12px 50%, #EFE8D8 6px, transparent 6.5px);background-size:24px 12px;background-repeat:repeat-x;"></div>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="background:#18140F;padding:36px 25px 30px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:22px;letter-spacing:1px;color:#EFE8D8;">
                    <span style="color:#C13A1F;">●</span>&nbsp;DABBA
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;color:#B9AF9A;font-size:13px;line-height:20px;font-family:'Courier New',Courier,monospace;letter-spacing:0.5px;">
                EVERY ORDER, ON TIME.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 36px 10px;">

              <p style="margin:0 0 18px;color:#C13A1F;font-size:12px;letter-spacing:1.5px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;">
                — Password reset
              </p>

              <h1 style="margin:0 0 20px;color:#18140F;font-size:26px;font-family:Arial,Helvetica,sans-serif;font-weight:700;letter-spacing:-0.3px;">
                Reset your password
              </h1>

              <p style="margin:0 0 16px;color:#4A443A;font-size:15px;line-height:26px;font-family:Arial,Helvetica,sans-serif;">
                Hi there,
              </p>

              <p style="margin:0 0 28px;color:#4A443A;font-size:15px;line-height:26px;font-family:Arial,Helvetica,sans-serif;">
                We received a request to reset the password on your <strong style="color:#18140F;">Dabba</strong> account. Use the code below to continue. If you didn't request this, you can ignore this email.
              </p>

              <!-- OTP ticket box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0" style="background:#EFE8D8;border:1px dashed #18140F;margin:0 0 26px;">
                      <tr>
                        <td style="padding:10px 30px 4px;text-align:center;">
                          <span style="font-size:10px;letter-spacing:1.5px;color:#4A443A;font-family:'Courier New',Courier,monospace;text-transform:uppercase;">Verification code</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:2px 34px 14px;text-align:center;">
                          <span style="font-size:36px;font-weight:700;color:#C13A1F;letter-spacing:14px;font-family:'Courier New',Courier,monospace;">
                            ${otp}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 18px;color:#4A443A;font-size:14px;line-height:24px;font-family:'Courier New',Courier,monospace;">
                Valid for <strong style="color:#18140F;">10 minutes</strong> from the time this email was sent.
              </p>

              <p style="margin:0 0 18px;color:#4A443A;font-size:15px;line-height:26px;font-family:Arial,Helvetica,sans-serif;">
                Please don't share this code with anyone. Dabba will never ask for your OTP over phone, chat, or email.
              </p>

              <p style="margin:0 0 30px;color:#4A443A;font-size:15px;line-height:26px;font-family:Arial,Helvetica,sans-serif;">
                Didn't request this? Your account is still safe — no changes have been made.
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <hr style="border:none;border-top:1px dashed #D6CBAE;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 36px 32px;background:#F1ECE1;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:14px;color:#18140F;letter-spacing:0.5px;">
                <span style="color:#C13A1F;">●</span>&nbsp;DABBA
              </p>
              <p style="margin:0;color:#7A7365;font-size:12px;line-height:20px;font-family:'Courier New',Courier,monospace;">
                Order fast. Track live. Eat on time.
              </p>
              <p style="margin:18px 0 0;color:#9A9382;font-size:11px;line-height:18px;font-family:'Courier New',Courier,monospace;">
                © 2026 Dabba Technologies · This is an automated email, please don't reply.
              </p>
            </td>
          </tr>

          <!-- Perforated ticket edge (bottom) -->
          <tr>
            <td style="line-height:0;font-size:0;">
              <div style="height:12px;background-image:radial-gradient(circle at 12px 50%, #EFE8D8 6px, transparent 6.5px);background-size:24px 12px;background-repeat:repeat-x;"></div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

    await sendEmail(email, subject, message);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};


export default SendOTPEmail;
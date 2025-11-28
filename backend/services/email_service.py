from ..config import settings
import json
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_report_email(to_email: str, report_content: dict):
    """
    Sends the report to the user via email.
    If SMTP settings are missing, prints a mock message to the console.
    """
    logger.info(f"Attempting to send report email to: {to_email}")

    if not (settings.SMTP_SERVER and settings.SMTP_USERNAME and settings.SMTP_PASSWORD):
        logger.warning("SMTP settings are missing. Sending MOCK email.")
        print(f"MOCK EMAIL TO {to_email}")
        print("-" * 20)
        print(f"Subject: Your Founder Clarity Report")

        summary = {
            "mindset_shift": report_content.get("mindset_shift"),
            "operational_focus": report_content.get("operational_focus"),
            "next_move": report_content.get("next_move")
        }
        print(f"Content Summary: {json.dumps(summary, indent=2)}")
        print("-" * 20)
        return

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Your Founder Clarity Report"

        # HTML version only
        html_body = f"""
<html>
  <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
    <p>Hello,</p>

    <p>Here is your personalized <strong>Founder Clarity Report</strong>.</p>

    <div style="padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px;">
      <h3 style="margin-top: 0;">🌟 Mindset Shift</h3>
      <p style="margin: 8px 0;">{report_content.get('mindset_shift', 'N/A')}</p>

      <h3>🏗️ Operational Focus</h3>
      <p style="margin: 8px 0;">{report_content.get('operational_focus', 'N/A')}</p>

      <h3>🎯 Next Move</h3>
      <p style="margin: 8px 0;">{report_content.get('next_move', 'N/A')}</p>

      <h3 style="margin-top: 24px;">📘 Full Report</h3>
      <div style="margin: 8px 0; max-width: 520px; line-height: 1.5;">
       <p style="margin: 0;">
        {report_content.get('full_report_text', '')}
       </p>
      </div>
    </div>

    <p>If you have any questions or want help interpreting your results, feel free to reply.</p>

    <p>Best regards,<br><strong>The Founder Compass Team</strong></p>
  </body>
</html>
"""


        # Attach HTML only
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent successfully to {to_email}")

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}", exc_info=True)

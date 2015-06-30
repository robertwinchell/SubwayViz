using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Data;
using System.Reflection;
using System.Web;
using System.IO;
using System.Drawing;
using System.Runtime.Remoting.Messaging;


namespace Quiz.Web
{
   public class claCommon
    {
       public int SendMail(string toEmail, string fromEmail, string strSubject, string strBody)
       {

           string fromLoginEmail = System.Configuration.ConfigurationSettings.AppSettings["MailUid"];
           string password = System.Configuration.ConfigurationSettings.AppSettings["MailPwd"];
           string host = System.Configuration.ConfigurationSettings.AppSettings["smtpAddress"];
           int ret = 0;
           //create the mail message
           MailMessage mail = new MailMessage();
           //set the addresses
           if (fromEmail.Length > 0)
           {
               mail.From = new MailAddress(fromEmail, "udal.bharti");
           }
           else
           {
               mail.From = new MailAddress(fromLoginEmail, "udal.bharti");
           }

           mail.To.Add(toEmail);
           mail.CC.Add("udal.bharti@gmail.com");
           //set the content
          //if (cv!="")
          //{
          //    string[] arr = cv.Split('*');
          //    foreach (var c in arr)
          //    {
          //        if (c != "")
          //        {
          //            mail.Attachments.Add(new Attachment(c));
          //        }
          //    }
          //}
           
           mail.Subject = strSubject;
           mail.SubjectEncoding = System.Text.Encoding.UTF8;
           mail.Body = strBody;
           mail.BodyEncoding = System.Text.Encoding.GetEncoding("utf-8");
           mail.IsBodyHtml = true;
           ///// imt
           System.Net.Mail.AlternateView plainView = System.Net.Mail.AlternateView.CreateAlternateViewFromString
          (System.Text.RegularExpressions.Regex.Replace(strBody, @"<(.|\n)*?>", string.Empty), null, "text/plain");
           System.Net.Mail.AlternateView htmlView = System.Net.Mail.AlternateView.CreateAlternateViewFromString(strBody, null, "text/html");
           mail.AlternateViews.Add(plainView);
           mail.AlternateViews.Add(htmlView);
          
           SmtpClient smtp = new SmtpClient(host);
           System.Net.NetworkCredential netcred = new System.Net.NetworkCredential(fromLoginEmail, password);
           smtp.UseDefaultCredentials = false;
           // smtp.EnableSsl = true;

           smtp.Credentials = netcred;
           smtp.Port = Convert.ToInt32(System.Configuration.ConfigurationSettings.AppSettings["Port"]);
           smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
           try
           {
               // Mail Sending Stop due to Conditional Checking.
               smtp.Send(mail);
               ret = 1;
           }
           catch (Exception ex)
           {
               throw ex;
               ret = 0;
           }
           return ret;
       }

       public const char enDash = (char)0x2013;
       public const char rsingleQuote = (char)0x2019;
       public static string ReplaceSpecialCharecters(string stringtoreplce, string charwithreplace)
       {
           string str = string.Empty;

           if (stringtoreplce.Contains(" "))
               stringtoreplce = stringtoreplce.Replace(" ", "-");

           if (stringtoreplce.Contains(enDash))
               stringtoreplce = stringtoreplce.Replace(enDash, '-');

           if (stringtoreplce.Contains('~'))
               stringtoreplce = stringtoreplce.Replace('~', '-');

           if (stringtoreplce.Contains('`'))
               stringtoreplce = stringtoreplce.Replace('`', '-');

           if (stringtoreplce.Contains('!'))
               stringtoreplce = stringtoreplce.Replace('!', '-');

           if (stringtoreplce.Contains('@'))
               stringtoreplce = stringtoreplce.Replace('@', '-');


           if (stringtoreplce.Contains('#'))
               stringtoreplce = stringtoreplce.Replace('#', '-');


           if (stringtoreplce.Contains('$'))
               stringtoreplce = stringtoreplce.Replace('$', '-');


           if (stringtoreplce.Contains('%'))
               stringtoreplce = stringtoreplce.Replace('%', '-');


           if (stringtoreplce.Contains('^'))
               stringtoreplce = stringtoreplce.Replace('^', '-');

           if (stringtoreplce.Contains('&'))
               stringtoreplce = stringtoreplce.Replace('&', '-');

           if (stringtoreplce.Contains('*'))
               stringtoreplce = stringtoreplce.Replace('*', '-');


           if (stringtoreplce.Contains('<'))
               stringtoreplce = stringtoreplce.Replace('<', '-');

           if (stringtoreplce.Contains('>'))
               stringtoreplce = stringtoreplce.Replace('>', '-');

           if (stringtoreplce.Contains(','))
               stringtoreplce = stringtoreplce.Replace(',', '-');

           if (stringtoreplce.Contains('/'))
               stringtoreplce = stringtoreplce.Replace('/', '-');


           if (stringtoreplce.Contains(';'))
               stringtoreplce = stringtoreplce.Replace(';', '-');

           if (stringtoreplce.Contains(':'))
               stringtoreplce = stringtoreplce.Replace(':', '-');

           if (stringtoreplce.Contains('|'))
               stringtoreplce = stringtoreplce.Replace('|', '-');

           if (stringtoreplce.Contains('\\'))
               stringtoreplce = stringtoreplce.Replace('\\', '-');


           if (stringtoreplce.Contains('"'))
               stringtoreplce = stringtoreplce.Replace('"', '-');

           if (stringtoreplce.Contains(rsingleQuote))
               stringtoreplce = stringtoreplce.Replace(rsingleQuote, '-');

           if (stringtoreplce.Contains('.'))
               stringtoreplce = stringtoreplce.Replace('.', '-');



           return stringtoreplce;
       }

      
    }
}

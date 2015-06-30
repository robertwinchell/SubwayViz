using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using Quiz.Web.Models;
//using Quiz.DL;
using Quiz.BL;
using System.Configuration;
using Quiz.DL;


namespace Quiz.Web.Controllers
{
    public class HomeController : Controller
    {
        UserBL objuserbl = new UserBL();
        public ActionResult Index()
        {
            ViewBag.Message = "Modify this template to jump-start your ASP.NET MVC application.";

            return View();
        }

        //[HttpPost]
        public ActionResult InsertUser(List<UserModel> UserList)
        {
            string json = JsonConvert.SerializeObject(UserList);
            //write string to file
            string fullPath = Path.Combine(Server.MapPath("~/dynamicfolder/User.js"));
            System.IO.File.WriteAllText(fullPath, json);
            return Json(true, JsonRequestBehavior.AllowGet);
        }


        public ActionResult InsertAnswer(List<AnswerModel> AnswerList)
        {
            string json = JsonConvert.SerializeObject(AnswerList);
            //write string to file
            string fullPath = Path.Combine(Server.MapPath("~/dynamicfolder/UserAnswer.js"));
            System.IO.File.WriteAllText(fullPath, json);
            return Json(true, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult Upload(FormCollection formdata)
        {

            try
            {
                HomeModel model = new HomeModel();
                int Userid = 2;
                string email = "test@test.com";
                string name = string.Empty;
                if (Request.Files.Count > 0)
                {
                    List<string> exts = new List<string>();
                    exts.Add(".gif");
                    exts.Add(".jpg");
                    exts.Add(".jpeg");
                    exts.Add(".bmp");
                    exts.Add(".png");
                    var file = Request.Files[0];
                    if (exts.Contains(System.IO.Path.GetExtension(file.FileName).ToLower()))
                    {
                        //Random rnd = new Random();
                        //name = rnd.Next(111, 9999).ToString() + "_" + System.IO.Path.GetFileName(file.FileName);
                        //name = name.Replace("-", "_");

                        name = Userid + "_" + System.IO.Path.GetFileName(file.FileName);
                        string fullPath = Path.Combine(Server.MapPath("~/dynamicfolder/UserAnswerImage"), name);
                        file.SaveAs(fullPath);
                        var data = objuserbl.UpdateUser(new User{ ID = Userid, Email = email, Image = name, Completed = false});

                    }
                }


                return Json(name, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                return View("~/Views/Shared/Error.cshtml");
            }
        }

        public ActionResult Error(string message)
        {
            ViewBag.Message = message;
            return View("~/Views/Shared/Error.cshtml");
        }

        //[HttpPost]
        public ActionResult SendMessage(FormCollection formdata)
        {
            int result = 0;
            bool message = false;
            claCommon objCom = new claCommon();
            try
            {
                string UserEmail = Convert.ToString(formdata["UserEmail"]);
                string Message = Convert.ToString(formdata["Message"]);
                string body = "";
                body = "Dear Human," + "<br />" + Message + "<br /><br />";
                body = body + "Thank you for participating!.<br />";

                string subject = "Survey thanks";
                result = objCom.SendMail(UserEmail, "test@test.com", subject, body);
                if (result > 0)
                {
                    int Userid = Convert.ToInt32(formdata["Userid"]);
                    var data = objuserbl.UpdateUser(new User { ID = Userid, Email = UserEmail, Image = null, Completed = true });

                    message = true;
                }
                return Json(message, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult InsertUpdateUser(FormCollection formdata)
        {
            string UserEmail = Convert.ToString(formdata["UserEmail"]);
            var data = objuserbl.UpdateUser(new User { Email = UserEmail, Image = null, Completed = false });
            return Json(data, JsonRequestBehavior.AllowGet);
        }
    }
}

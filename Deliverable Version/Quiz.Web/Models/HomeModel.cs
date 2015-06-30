using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Quiz.Web.Models
{
    public class HomeModel
    {
        public HomeModel()
        {
            AnswerList = new List<AnswerModel>();
            UserList = new List<UserModel>();
            QustionList = new List<QuestionModel>();
        }
        public List<AnswerModel> AnswerList { get; set; }
        public List<UserModel> UserList { get; set; }
        public List<QuestionModel> QustionList { get; set; }
       
    }

    public class AnswerModel
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public int QuestionId { get; set; }
        public string Answer { get; set; }
    }

    public class UserModel
    {
        public int UserId { get; set; }
        public string Email { get; set; }
    }

    public class QuestionModel
    {
        public int id { get; set; }
        public string question { get; set; }
        public string image { get; set; }
        public string type { get; set; }
        public string options { get; set; }
        public string correctAnswer { get; set; }
        public string percentage { get; set; }
    }
}
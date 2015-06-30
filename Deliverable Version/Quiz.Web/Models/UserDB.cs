using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Quiz.Web.Models
{
    public class UserDB
    {
        public int ID { get; set; }
        public string Email { get; set; }
        public string Image { get; set; }
        public int Completed { get; set; }
    }

}

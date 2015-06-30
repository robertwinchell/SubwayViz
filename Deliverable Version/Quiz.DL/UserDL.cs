using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Quiz.DL
{
    public class UserDL
    {
        public bool IsEmailInUse(string email)
        {
            var db = new QuizContainer();
            return db.Users.Any(u => u.Email == email.ToLower());
        }

        public User Get(int id)
        {
            var db = new QuizContainer();
            return db.Users.FirstOrDefault(u => u.ID == id);
        }

        public IList<User> GetAll()
        {
            var db = new QuizContainer();
            return db.Users.ToList();
        }

        public User SaveUser(string email, string image, bool completed)
        {
            var db = new QuizContainer();
            var user = new User
            {
                Email = email.ToLower(),
                Image = image,
                Completed = completed,
            };
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }


        public User UpdateUser(int ID, string email, string image, bool completed)
        {
            var db = new QuizContainer();
            var user = db.Users.FirstOrDefault(a => a.ID == ID);
            if (user != null)
            {
                user.Email = email.ToLower();
                if (!string.IsNullOrEmpty(image))
                {
                    user.Image = image;
                }
                user.Completed = completed;
                db.SaveChanges();
            }
            return user;
        }
    }
}

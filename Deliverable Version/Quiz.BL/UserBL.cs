using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Quiz.DL;

namespace Quiz.BL
{
    public class UserBL
    {
        readonly UserDL _userDl = new UserDL();

        public bool IsEmailInUse(string email)
        {
            return _userDl.IsEmailInUse(email);
        }


        public User Get(int id)
        {
            return _userDl.Get(id);
        }

        public IList<User> GetAll()
        {
            return _userDl.GetAll();
        }

        public User SaveUser(User user)
        {
            var returnedUser = _userDl.SaveUser(user.Email, user.Image, user.Completed);
            return returnedUser;
        }

        public User UpdateUser(User user)
        {
            var returnedUser = _userDl.UpdateUser(user.ID, user.Email, user.Image, user.Completed);
            return returnedUser;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Quiz.BL;
using Quiz.DL;
using Quiz.Web.Models;

namespace Quiz.Web.Controllers
{
    public class UserController : ApiController
    {
        private const string NullUserSupplied = "Null user supplied";
        private const string EmailInUse = "Email in use";
        private const string ResourceAndUserDoNotMatch = "The resource ID and the User.ID do not match";
        private const string DatabaseProblem = "A problem occured communicating to the database";
        private UserBL _userBl = new UserBL();

        // GET api/User
        public IEnumerable<User> GetUsers()
        {
            try
            {
                return _userBl.GetAll();
            }
            catch (SqlException)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.InternalServerError, DatabaseProblem));
            }
        }

        // GET api/User/5
        public User GetUser(int id)
        {
            try
            {
                User user = _userBl.Get(id);
                if (user == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return user;
            }
            catch (SqlException)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.InternalServerError, DatabaseProblem));
            }
        }

        // PUT api/User/5
        public HttpResponseMessage PutUser(int id, User user)
        {
            try
            {
                if (user == null)
                {
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, NullUserSupplied);
                }

                if (id != user.ID)
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, ResourceAndUserDoNotMatch);
                }

                try
                {
                    //user.Image = user.Image + random;
                    _userBl.UpdateUser(user);
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (SqlException)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, DatabaseProblem);
            }
        }

        // POST api/User
        public HttpResponseMessage PostUser(User user)
        {
            try
            {
                if (user != null)
                {
                    if (_userBl.IsEmailInUse(user.Email))
                    {
                        return Request.CreateErrorResponse(HttpStatusCode.Conflict, EmailInUse);
                    }

                    var returnedUser = _userBl.SaveUser(user);

                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, returnedUser);
                    response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = returnedUser.ID }));
                    return response;
                }
                else
                {
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, NullUserSupplied);
                }
            }
            catch (SqlException)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, DatabaseProblem);
            }
        }

        // DELETE api/User/5
        public HttpResponseMessage DeleteUser(int id)
        {
            return Request.CreateErrorResponse(HttpStatusCode.NotImplemented, ModelState);
        }

    }
}
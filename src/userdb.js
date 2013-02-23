var client
  , async  = require('async')
  , util   = require('util')
  , crypto = require('crypto');

exports.init = function (_client, _cb)
{
  client =_client;
  _cb(null);
}

exports.createUser = function (username, password, email, cb)
{
  var user =
    {
      username: username,
      email: email
    };

  async.waterfall(
    [
      // check if user exists
      function (_cb)
      {
        exports.getUser(username, _cb);
      },
      function (user, _cb)
      {
        if(user)
          _cb("userexists");
        else
          _cb(null);
      },
      // get random salt
      function (_cb)
      {
        crypto.randomBytes(48, _cb);
      },
      // hash password
      function (salt, _cb)
      {
        user.salt = salt.toString('hex');
        hashPassword(password, user.salt, _cb);
      }
    ],
    function (err, result)
    {
      if(!err)
      {
        user.password = result;
        client.set("user:" + username, JSON.stringify(user));
      }
      cb(err);
    });
}

exports.getUser = function (username, cb)
{
  client.get("user:" + username, function (err, user)
    {
      if(!err)
        user = JSON.parse(user);
      cb(err, user);
    });
}

exports.checkPassword = function (username, password, cb)
{
  var user;

  async.waterfall(
    [
      // get user
      function (_cb)
      {
        exports.getUser(username, _cb);
      },
      // hash given password
      function (_user, _cb)
      {
        if(_user)
        {
          user = _user;
          hashPassword(password, _user.salt, _cb);
        }
        else
        {
          cb("nouser");
        }
      },
      // compare hashes
      function (_hash, _cb)
      {
        var isValid = (user.password === _hash);
        _cb(null, isValid);
      }
    ], cb);
}

function hashPassword(password, salt, cb)
{
  crypto.pbkdf2(password, salt, 1200, 24, processHash);

  function processHash(err, key)
  {
    if(!err)
      key = Buffer(key, 'binary').toString('hex');
    cb(err, key);
  }
}

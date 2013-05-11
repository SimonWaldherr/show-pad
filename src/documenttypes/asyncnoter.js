var async  = require('async')
  , express = require('express')
  , path = require('path')
  , sharejs = require('share').server

var server = null
  , logger = null
  , model  = null

exports.name = "asyncnoter";

/* Init */
exports.init = function (_server, cb)
{
  server = _server;
  logger = server.getLogger(exports.name);

  cb();
}

exports.initExpress = function (app)
{
  var options =
    {
      staticpath: "/sharejs",
      browserChannel:
      {
        base: "/sharejs/sock_bc",
        cors: '*'
      },
      rest:
      {
        base: "/sharejs/rest"
      },
      auth: auth,
      db: { type: 'none' }
    };

  sharejs.attach(app, options);
  model = app.model;
  app.use("/sharejs/channel", express.static(path.resolve(__dirname + '/../../node_modules/share/node_modules/browserchannel/dist')));
}

function auth(agent, action)
{
  var username = "todo";

  switch(action.type)
  {
    // connecting for everyone, also set the name
    case "connect":
      agent.name = username;
      handleAction(action, username, true);
      break;

    // creating & deleting for nobody.
    // creating and deleting docs is done serverside in onCreateDoc / onDeleteDoc
    case "create":
    case "delete":
      handleAction(action, username, false);
      break;

    // reading & writing for registered users
    case "update":
    case "read":
      handleAction(action, username, true);
      break;
  }
}

function handleAction(action, username, accept)
{
  if(["update"].indexOf(action.type) == -1)
  {
    console.debug("[%s] [%s] ShareJS-Action: %s (%s)",
      action.docName,
      username,
      action.type,
      accept ? "accepted" : "rejected");
  }

  if(accept)
    action.accept();
  else
    action.reject();
}

/* Users */
exports.onLogin = function (user, res, cb)
{
  cb();
}

exports.onCreateUser = function (user, cb)
{
  cb();
}

exports.onLogout = function (user, res, cb)
{
  cb();
}

/* Groups */
exports.onCreateGroup = function (group, cb)
{
  cb();
}

/* Docs */
exports.onCreateDoc = function (doc, cb)
{
  model.create(doc.docname, "json", cb);
}

exports.onDeleteDoc = function (doc, cb)
{
  model.delete(doc.docname, cb);
}

exports.onRequestDoc = function (req, res, user, doc, cb)
{
  var locals =
  {
    docname: doc.docname,
    groupname: doc.group
  };

  res.render('documenttypes/asyncnoter.ejs', locals);
  cb();
}

/* Pad text */
exports.setText = function (doc, text, cb)
{
  cb();
}

exports.getText = function (doc, cb)
{
  cb();
}

/* other */
exports.getLastModifed = function (doc, cb)
{
  cb();
}
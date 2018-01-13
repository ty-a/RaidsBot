const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const emoji = require("node-emoji");
const fs = require("fs");

var bmRoles = {};
var yakaRoles = {};
var raidsRolesMessage;
var bmEmoji = "";
var yakaEmoji = "";

var awaitingReply = new Map();


function resetRoles() {
  bmRoles = {
    base:null,
    backup:null,
    nc:null,
    p13:null,
    p2:null,
    dps:[]
  };

  yakaRoles = {
    base:null,
    nt:null,
    cpr:null,
    mainstun:null,
    backupstun:null,
    pt:null,
    dbl:null,
    jw:null,
    shark10:null,
    stun5:[],
    stun0:null,
    dps:[]
  };
}

function buildBMTable() {
  var message = "";
  message += "===========\n";
  message += "BEASTMASTER - " + (bmEmoji.length == 0 ? generateRandomEmoji() : bmEmoji) + " \n";
  message += "===========\n";
  message += "Base Tank       ----> " + (bmRoles.base == null ? "": bmRoles.base.toString());
  message += "\nBackup            ----> " + (bmRoles.bu == null ? "": bmRoles.bu.toString());
  message += "\nP1/3                 ----> " + (bmRoles.p13 == null ? "": bmRoles.p13.toString());
  message += "\nP2                     ----> " + (bmRoles.p2 == null ? "": bmRoles.p2.toString());
  message += "\nN Chargers     ----> " + (bmRoles.nc == null ? "": bmRoles.nc.toString());
  for(var i = 0; i < 5; i++) {
    message += "\nDPS                  ----> " + (bmRoles.dps[i] == null ? "": bmRoles.dps[i].toString());
  }

  return message;
}

function buildYakaTable() {
  var message = "";
  message += "=========\n";
  message += "YAKAMARU - " + (yakaEmoji.length == 0 ? generateRandomEmoji() : yakaEmoji) + " \n";
  message += "=========\n";
  message += "Base        ----> " + (yakaRoles.base == null ? "" : yakaRoles.base.toString());
  message += "\nNT           ----> " + (yakaRoles.nt == null ? "" : yakaRoles.nt.toString());
  message += "\nPT            ----> " + (yakaRoles.pt == null ? "" : yakaRoles.pt.toString());
  message += "\nCPR         ----> " + (yakaRoles.cpr == null ? "" : yakaRoles.cpr.toString());
  message += "\nDBL         ----> " + (yakaRoles.dbl == null ? "" : yakaRoles.dbl.toString());
  message += "\nMS          ----> " + (yakaRoles.mainstun == null ? "" : yakaRoles.mainstun.toString());
  message += "\nBUS         ----> " + (yakaRoles.backupstun == null ? "" : yakaRoles.backupstun.toString());
  message += "\nShark10  ----> " + (yakaRoles.shark10 == null ? "" : yakaRoles.shark10.toString());
  for(var i = 0; i < 2; i++ ) {
    message += "\nSt5          ----> " + (yakaRoles.stun5[i] == null ? "" : yakaRoles.stun5[i].toString());
  }
  message += "\nSt0          ----> " + (yakaRoles.stun0 == null ? "" : yakaRoles.stun0.toString());
  for( i = 0; i < 2; i++ ) {
    // only add dps rows if defined
    message += (yakaRoles.dps[i] == null ? "" : "\nDPS          ----> " +  yakaRoles.dps[i].toString());
  }

  message += "\nJW          ----> " + (yakaRoles.jw == null ? "" : yakaRoles.jw.toString());

  return message;
}

function createMessage() {
  client.channels.find("name", config.channel).send(buildBMTable() + "\n\n" + buildYakaTable()).then(
    message => {
      raidsRolesMessage = message;
    }
  );
}

function updateTables() {
  raidsRolesMessage.edit(
    buildBMTable() + "\n\n" + buildYakaTable()
  );
}

function addRoleChangeToAwaitingReply(user, target, role, boss) {
  if(awaitingReply.has(user)) {
    // If they've already made a request, then made a new one
    // delete the old one, so the old timer won't delete new request
    removeRoleChangeFromAwaitingReply(user);
  }
  var timeout = setTimeout( () => {
    awaitingReply.delete(user);
  }, 300000);
  awaitingReply.set(user, [target, role, boss, timeout]);
}

function removeRoleChangeFromAwaitingReply(user) {
  clearTimeout(awaitingReply.get(user)[3]);
  awaitingReply.delete(user);
}

function generateRandomEmoji() {
  var out = "";

  for(var i = 0; i < 3; i++) {
    out += emoji.random().emoji;
  }
  return out;
}

function setRole(setter, target, role, boss) {
  if (boss == "yaka") {
    switch(role) {
    case "base":
      yakaRoles.base = target;
      break;
    case "nt":
      yakaRoles.nt = target;
      break;
    case "pt":
      yakaRoles.pt = target;
      break;
    case "mainstun":
      yakaRoles.mainstun = target;
      break;
    case "backupstun":
      yakaRoles.backupstun = target;
      break;
    case "cpr":
      yakaRoles.cpr = target;
      break;
    case "dbl":
      yakaRoles.dbl = target;
      break;
    case "stun0":
      yakaRoles.stun0 = target;
      break;
    case "jw":
      yakaRoles.jw = target;
      break;
    case "dps":
      if(yakaRoles.dps.length >= 2) {
        yakaRoles.dps.pop();
      }
      yakaRoles.dps.push(target);
      break;
    case "stun5":
      if(yakaRoles.stun5.length >= 2) {
        yakaRoles.stun5.pop();
      }
      yakaRoles.stun5.push(target);
      break;
    case "shark10":
      yakaRoles.shark10 = target;
    }
  } else /* BM */ {
    switch(role) {
    case "base":
      bmRoles.base = target;
      break;
    case "bu":
      bmRoles.bu = target;
      break;
    case "p13":
      bmRoles.p13 = target;
      break;
    case "p2":
      bmRoles.p2 = target;
      break;
    case "nc":
      bmRoles.nc = target;
      break;
    case "dps":
      if(bmRoles.dps.length >= 5) {
        bmRoles.dps.pop();
      }
      bmRoles.dps.push(target);
      break;
    }
  }

}

var isRaidsRunning = false;

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {

  if(!message.content.startsWith(config.trigger) || message.author.bot) {
    return;
  }

  const args = message.content.slice(config.trigger.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  var outmessage = "";

  switch(command) {
  case "ping":
    message.channel.send("pong!");
    break;
  case "reload":
    delete require.cache[require("./config.json")];
    message.reply("Reloaded config file");
    break;
  case "setchannel": {
    let newChannel = message.content.split(" ").splice(1)[0];
    config.channel = newChannel;
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
    message.channel.send("updated channel");
    break;
  }
  case "test":
    message.reply("The server was created at: " + message.guild.createdAt);
    break;
  case "confirm":
    if(awaitingReply.has(message.author)) {
      var data = awaitingReply.get(message.author);
      // data = [target, role, boss]
      setRole(data[0], data[0], data[1], data[2]);
      removeRoleChangeFromAwaitingReply(message.author);

      message.reply("role change confirmed!");
      updateTables();
    } else {
      return;
    }
    break;
  case "start":
    resetRoles();
    isRaidsRunning = true;
    bmEmoji = "";
    yakaEmoji = "";
    if(args.length == 0) {
      message.channel.send("ALRIGHT @everyone WHO IS READY TO RAID?!? Claim those role spots now using ^bmroles and ^yakaroles");
    } else {
      message.channel.send(args.join(" "));
    }

    createMessage();
    break;
  case "end":
    if(!isRaidsRunning) {
      message.reply("don't get ahead of yourself, there is no raids active at the moment!");
      return;
    }
    isRaidsRunning = false;
    if(args.length == 0) {
      message.channel.send("That's a wrap folks! Cya next time for raids(tm)");
    } else {
      message.channel.send(args.join(" "));
    }
    break;
  case "bmrole":
  case "bmroles":
    if(!isRaidsRunning) {
      message.reply("No raids is currently running! Ask a host to ^start");
      return;
    } else {
      if(args.length == 0) {
        message.reply("You must specify a role. Legal values: base, bu, nc, dps, p13, p2");
        return;
      }
      var role = args[0].toLowerCase();

      switch(role) {
      case "base": {
        if(bmRoles.base == null) {
          setRole(message.author, message.author, role, "bm");
          message.reply("you are now listed as base tank!");
        } else {
          message.reply(bmRoles.base.toString() + " is already base!");
        }
        break;
      }
      case "bu": {
        if(bmRoles.bu == null) {
          setRole(message.author, message.author, role, "bm");
          message.reply("you are now listed as backup tank!");
        } else {
          message.reply(bmRoles.bu.toString() + " is already backup!");
        }
        break;
      }
      case "p13": {
        if(bmRoles.p13 == null) {
          setRole(message.author, message.author, role, "bm");
          message.reply("you are now listed as p1/3!");
        } else {
          message.reply(bmRoles.p13.toString() + " is already p1/3!");
        }
        break;
      }
      case "p2": {
        if(bmRoles.p2 == null) {
          setRole(message.author, message.author, role, "bm");
          message.reply("you are now listed as p2!");
        } else {
          message.reply(bmRoles.p2.toString() + " is already p2!");
        }
        break;
      }
      case "nc": {
        if(bmRoles.nc == null) {
          setRole(message.author, message.author, role, "bm");
          message.reply("you are now listed as north chargers!");
        } else {
          message.reply(bmRoles.nc.toString() + " is already north chargers!");
        }
        break;
      }
      case "dps": {
        // There can be 5 dps at BM
        if(bmRoles.dps.length < 5) {
          setRole(message.author, message.author, role, "bm");
          message.reply("you are now listed as a sweaty leach!");
        } else {
          message.reply(bmRoles.dps.join(", ") + " are already leaching!");
        }
        break;
      }
      default: {
        message.reply("I don't know what the " + args[0] + " role is, legal values are base, bu, nc, dps, p13, p2");
      }
      }
    }
    updateTables();
    break;
    /* END OF BMROLES */
  case "yakaroles":
  case "yakarole":
    if(!isRaidsRunning) {
      message.reply("No raids is currently running! Please ask a host to ^start");
      return;
    }

    if(args.length == 0) {
      message.reply("You must specify a role. Legal values: base, nt, pt, cpr, dbl, st5, st0, jw, sh10, dps");
      return;
    }

    role = args[0].toLowerCase();
    switch(role) {
    case "base": {
      if(yakaRoles.base == null) {
        setRole(message.author, message.author, "base", "yaka");
        message.reply("you are now listed as yaka base tank!");
      } else {
        message.reply(yakaRoles.base.toString() + " is already yaka base!");
      }
      break;
    }
    case "nt": {
      if(yakaRoles.nt == null) {
        setRole(message.author, message.author, "nt", "yaka");
        message.reply("you are now listed as yaka north tank!");
      } else {
        message.reply(yakaRoles.nt.toString() + " is already yaka north tank!");
      }
      break;
    }
    case "pt": {
      if(yakaRoles.pt == null) {
        setRole(message.author, message.author, "pt", "yaka");
        message.reply("you are now listed as yaka poison tank!");
      } else {
        message.reply(yakaRoles.pt.toString() + " is already yaka poison tank!");
      }
      break;
    }
    case "cpr": {
      if(yakaRoles.cpr == null) {
        setRole(message.author, message.author, "cpr", "yaka");
        message.reply("you are now listed as cpr!");
      } else {
        message.reply(yakaRoles.base.toString() + " is already cpr!");
      }
      break;
    }
    case "mainstun":
    case "main":
    case "ms": {
      if(yakaRoles.mainstun == null) {
        setRole(message.author, message.author, "mainstun", "yaka");
        message.reply("you are now listed as main stun");
      } else {
        message.reply(yakaRoles.mainstun.toString() + " is already mains stun!");
      }
      break;
    }
    case "backupstun":
    case "bus": {
      if(yakaRoles.backupstun == null) {
        setRole(message.author, message.author, "backupstun", "yaka");
        message.reply("you are now listed as backup stun!");
      } else {
        message.reply(yakaRoles.backupstun.toString() + " is already backup stun!");
      }
      break;
    }
    case "double":
    case "dbl": {
      if(yakaRoles.dbl == null) {
        setRole(message.author, message.author, "dbl", "yaka");
        message.reply("you are now listed as double!");
      } else {
        message.reply(yakaRoles.dbl.toString() + " is already double!");
      }
      break;
    }
    case "shark10":
    case "s10": {
      if(yakaRoles.shark10 == null) {
        setRole(message.author, message.author, "shark10", "yaka");
        message.reply("you are now listed as shark 10!");
      } else {
        message.reply(yakaRoles.shark10.toString() + " is already shark 10!");
      }
      break;
    }
    case "jw": {
      if(yakaRoles.jw == null) {
        setRole(message.author, message.author, "jw", "yaka");
        message.reply("you are now listed as jelly wrangler!");
      } else {
        message.reply(yakaRoles.jw.toString() + " is already jelly wrangler!");
      }
      break;
    }
    case "stun0":
    case "st0": {
      if(yakaRoles.stun0 == null) {
        setRole(message.author, message.author, "stun0", "yaka");
        message.reply("you are now listed as stun 0!");
      } else {
        message.reply(yakaRoles.stun0.toString() + " is already stun 0!");
      }
      break;
    }
    case "stun5":
    case "st5": {
      // There can be 2 stun5s
      if(yakaRoles.stun5.length < 2) {
        setRole(message.author, message.author, "stun5", "yaka");
        message.reply("you are now listed as a stun 5!");
      } else {
        message.reply(yakaRoles.stun5.join(", ") + " are already stun 5s!");
      }
      break;
    }
    case "dps":
    case "leach": {
      // Usually there is 0, but I don't think we've had more than 2
      if(yakaRoles.dps.length < 2) {
        setRole(message.author, message.author, "dps", "yaka");
        message.reply("you are now listed as a leach!");
      } else {
        message.reply(yakaRoles.dps.join(", ") + " are already leaching! Do we really need more than 2? :thinking:");
      }
      break;
    }
    default: {
      message.reply("I don't know what the " + args[0] + " role is, legal values are base, nt, pt, cpr, dbl, st5, st0, jw, sh10, dps");
    }
    } // END YAKA ROLES SWITCH
    updateTables();
    break;

  case "yakaset":
    if(!isRaidsRunning) {
      message.reply("No raids is currently running! Please ask a host to ^start");
      return;
    }

    if(args.length == 0) {
      message.reply("Usage: " + config.trigger + "yakaset @user role. Legal values: base, nt, pt, cpr, dbl, st5, st0, jw, sh10, dps");
      return;
    } else if (args.length == 1) {
      message.reply("Usage: " + config.trigger + "yakaset @user role. Legal values: base, nt, pt, cpr, dbl, st5, st0, jw, sh10, dps");
      return;
    } else if (message.mentions.members.size == 0) {
      message.reply("Usage: " + config.trigger + "yakaset @user role. You gotta @mention them!");
      return;
    }

    var roleTarget = message.mentions.users.first();
    for(var i = 1; i < args.length; i++ ) {
      role = args[i];
      switch(role) {
      case "base": {
        if(yakaRoles.base == null) {
          setRole(message.author, roleTarget, "base", "yaka");
          outmessage += "base ";
        } else {
          message.reply(yakaRoles.base.toString() + " is already yaka base! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "base", "yaka");
        }
        break;
      }
      case "nt": {
        if(yakaRoles.nt == null) {
          setRole(message.author, roleTarget, "nt", "yaka");
          outmessage += "nt ";
        } else {
          message.reply(yakaRoles.nt.toString() + " is already yaka north tank! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "nt", "yaka");
        }
        break;
      }
      case "pt": {
        if(yakaRoles.pt == null) {
          setRole(message.author, roleTarget, "pt", "yaka");
          outmessage += "pt ";
        } else {
          message.reply(yakaRoles.pt.toString() + " is already yaka poison tank! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "pt", "yaka");
        }
        break;
      }
      case "cpr": {
        if(yakaRoles.cpr == null) {
          setRole(message.author, roleTarget, "cpr", "yaka");
          outmessage += "cpr ";
        } else {
          message.reply(yakaRoles.cpr.toString() + " is already cpr! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "cpr", "yaka");
        }
        break;
      }
      case "mainstun":
      case "main":
      case "ms": {
        if(yakaRoles.mainstun == null) {
          setRole(message.author, roleTarget, "mainstun", "yaka");
          outmessage += "main stun ";
        } else {
          message.reply(yakaRoles.mainstun.toString() + " is already main stun! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "mainstun", "yaka");
        }
        break;
      }
      case "backupstun":
      case "bus": {
        if(yakaRoles.backupstun == null) {
          setRole(message.author, roleTarget, "backupstun", "yaka");
          outmessage += "backup stun ";
        } else {
          message.reply(yakaRoles.backupstun.toString() + " is already backup stun! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "backupstun", "yaka");
        }
        break;
      }
      case "double":
      case "dbl": {
        if(yakaRoles.dbl == null) {
          setRole(message.author, roleTarget, "dbl", "yaka");
          outmessage += "double ";
        } else {
          message.reply(yakaRoles.dbl.toString() + " is already double! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "dbl", "yaka");
        }
        break;
      }
      case "shark10":
      case "s10": {
        if(yakaRoles.shark10 == null) {
          setRole(message.author, roleTarget, "shark10", "yaka");
          outmessage += "shark10 ";
        } else {
          message.reply(yakaRoles.shark10.toString() + " is already shark 10! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "shark10", "yaka");
        }
        break;
      }
      case "jw": {
        if(yakaRoles.jw == null) {
          setRole(message.author, roleTarget, "jw", "yaka");
          outmessage += "jelly wrangler ";
        } else {
          message.reply(yakaRoles.jw.toString() + " is already jelly wrangler! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "jw", "yaka");
        }
        break;
      }
      case "stun0":
      case "st0": {
        if(yakaRoles.stun0 == null) {
          setRole(message.author, roleTarget, "stun0", "yaka");
          outmessage += "stun 0 ";
        } else {
          message.reply(yakaRoles.stun0.toString() + " is already stun 0! Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "stun0", "yaka");
        }
        break;
      }
      case "stun5":
      case "st5": {
      // There can be 2 stun5s
        if(yakaRoles.stun5.length < 2) {
          setRole(message.author, roleTarget, "stun5", "yaka");
          outmessage += "stun5 ";
        } else {
          message.reply(yakaRoles.stun5.join(", ") + " are already stun 5s Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "stun5", "yaka");
        }
        break;
      }
      case "dps":
      case "leach": {
      // Usually there is 0, but I don't think we've had more than 2
        if(yakaRoles.dps.length < 2) {
          setRole(message.author, roleTarget, "dps", "yaka");
          outmessage += "leach ";
        } else {
          message.reply(yakaRoles.dps.join(", ") + " are already leaching! Do we really need more than 2? :thinking: Use ^confirm to confirm the change");
          addRoleChangeToAwaitingReply(message.author, roleTarget, "dps", "yaka");
        }
        break;
      }
      default: {
        message.reply("I don't know what the " + args[i] + " role is, legal values are base, nt, pt, cpr, dbl, st5, st0, jw, sh10, dps");
      }
      }
    } // END YAKASET ROLES SWITCH
    message.reply(roleTarget.toString() + " now has the roles " + outmessage.trim() + "!");
    updateTables();
    break;

  case "bmset":
    if(!isRaidsRunning) {
      message.reply("No raids is currently running! Ask a host to ^start");
      return;
    } else {
      if(args.length == 0) {
        message.reply("You must specify a role. Legal values: base, bu, nc, dps, p13, p2");
        return;
      } else if (args.length == 1) {
        message.reply("Usage: " + config.trigger + "bmset @user role. Legal values: base, bu, nc, dps, p13, p2");
        return;
      } else if (message.mentions.members.size == 0) {
        message.reply("Usage: " + config.trigger + "bmset @user role. You gotta @mention them!");
        return;
      }

      roleTarget = message.mentions.users.first();
      for( i = 1; i < args.length; i++ ) {
        role = args[i];
        switch(role) {
        case "base": {
          if(bmRoles.base == null) {
            setRole(message.author, roleTarget, "base", "bm");
            outmessage += "base ";
          } else {
            message.reply(bmRoles.base.toString() + " is already base! Use ^confirm to confirm the change");
            addRoleChangeToAwaitingReply(message.author, roleTarget, "base", "bm");
          }
          break;
        }
        case "bu": {
          if(bmRoles.bu == null) {
            setRole(message.author, roleTarget, "bu", "bm");
            outmessage += "backup ";
          } else {
            message.reply(bmRoles.bu.toString() + " is already backup! Use ^confirm to confirm the change");
            addRoleChangeToAwaitingReply(message.author, roleTarget, "bu", "bm");
          }
          break;
        }
        case "p13": {
          if(bmRoles.p13 == null) {
            setRole(message.author, roleTarget, "p13", "bm");
            outmessage += "p1/3 ";
          } else {
            message.reply(bmRoles.p13.toString() + " is already p1/3! Use ^confirm to confirm the change");
            addRoleChangeToAwaitingReply(message.author, roleTarget, "p13", "bm");
          }
          break;
        }
        case "p2": {
          if(bmRoles.p2 == null) {
            setRole(message.author, roleTarget, "p2", "bm");
            outmessage += "p2 ";
          } else {
            message.reply(bmRoles.p2.toString() + " is already p2! Use ^confirm to confirm the change");
            addRoleChangeToAwaitingReply(message.author, roleTarget, "p2", "bm");
          }
          break;
        }
        case "nc": {
          if(bmRoles.nc == null) {
            setRole(message.author, roleTarget, "nc", "bm");
            outmessage += "north chargers ";
          } else {
            message.reply(bmRoles.nc.toString() + " is already north chargers! Use ^confirm to confirm the change");
            addRoleChangeToAwaitingReply(message.author, roleTarget, "nc", "bm");
          }
          break;
        }
        case "dps": {
        // There can be 5 dps at BM
          if(bmRoles.dps.length < 5) {
            setRole(message.author, roleTarget, "dps", "bm");
            outmessage += "leach ";
          } else {
            message.reply(bmRoles.dps.join(", ") + " are already leaching!  Use ^confirm to confirm the change");
            addRoleChangeToAwaitingReply(message.author, roleTarget, "dps", "bm");
          }
          break;
        }
        default: {
          message.reply("I don't know what the " + role + " role is, legal values are base, bu, nc, dps, p13, p2");
        }
        }
      }
    }
    message.reply(roleTarget.toString() + " now has the roles: " + outmessage.trim() + "!");
    updateTables();
    break;
    /* END OF BMROLES */
  case "bmemoji": {
    if(!isRaidsRunning) {
      message.reply("There is no raids running, ask a host to ^start");
    }
    if(args.length == 0) {
      message.reply("You gotta provide some emoji yo");
      break;
    }
    bmEmoji = args.join(" ");
    message.reply("Beatsmaster Durzag Emoji updated!");
    updateTables();
    break;
  }
  case "yakaemoji": {
    if(!isRaidsRunning) {
      message.reply("There is no raids running, ask a host to ^start");
    }
    if(args.length == 0) {
      message.reply("You gotta provide some emoji yo");
      break;
    }
    yakaEmoji = args.join(" ");
    message.reply("Yakamaru Emoji updated!");
    updateTables();
    break;
  }
  }
});

client.login(config.token);

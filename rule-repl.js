const repl = require('repl');
const https = require('https');

const VO_HOSTNAME = 'portal.victorops.com';

const r = repl.start('> ');

r.context.getRules = getRules;
r.context.toggleRule = toggleRule;

/*
  getRules(organization:String, username:String, password:String)
  Displays all transmog rules for the given organization with the rule id
*/

function getRules(org, username, password) {
    if(arguments.length !== 3  || typeof org !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
        return "Bad parameters. Use: getRules(organization:String, username:String, password:String)";
    }
    getRulesPromise(org, username, password)
    .then((rules) => {
        rules.forEach((obj) =>{
            console.log('id: '+obj.id+' | When '+obj.alertField+' matches '+obj.alertValueMatch+' | '+(obj.flags < 4?'ENABLED':'DISABLED'));
        });
    }).catch((error) => {
        console.log('error in call', error);
    })
    return "Getting all transmog rules for " + org;
}

/*
    toggleRule(id:Number, organization:String, username:String, password:String)
    Toggles the specified transmog rule between enabled and disabled.
*/

function toggleRule(id, org, username, password) {
    // make sure arguments are correct
    if(arguments.length!==4 || typeof id !== 'number' || typeof org !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
        return "Call as toggleRule(ruleID:Number, organization:String, username:String, password:String)";
    }
    // make sure getRules has been called first
    getRulesPromise(org, username, password)
    .then((rules) => {
        // toggle rule
        var rule = rules.filter(function(item){
            return item.id === id;
        })[0];
        // flip the bit between 1 and 0
        if(rule.flags < 4){
            rule.flags += 4;
        } else {
            rule.flags -= 4;
        }

        toggleRulePromise(rule, org, username, password)
        .then(res => {
            console.log('id: '+res.id+' | When '+res.alertField+' matches '+res.alertValueMatch+' | '+(res.flags < 4?'ENABLED':'DISABLED'));
        }).catch(e => {
            console.log('There was a problem toggling the rule ', e);
        });

    }).catch((error) => {
        console.log('error in call', error);
    });
    return 'Toggling rule: '+id;
}

function getRulesPromise(org, username, password) {
    return new Promise((resolve, reject) => {
        https.request({
            method: 'GET',
            hostname: VO_HOSTNAME,
            path: '/api/v1/org/' + org + '/annotations',
            auth: username + ':' + password
        }, function(response) {
            var data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                data = JSON.parse(data);
                if(data.error){
                    console.log('error', data.error);
                    reject(data.error);
                } else {
                    resolve(data);
                }
            })
        }).on('error', (error) => {
          console.log('error', error.message);
          rules = null;
        }).end();
    })
}

function toggleRulePromise(rule, org, username, password) {
  return new Promise((resolve, reject) => {
    var payload = JSON.stringify(rule);
    var req = https.request({
      method: 'PUT',
      hostname: VO_HOSTNAME,
      path: '/api/v1/org/' + org + '/annotationrule/' + rule.id,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      },
      auth: username + ':' + password
    })
    req.on('error', (e) => {
      reject(e);
    })
    req.write(payload);
    req.end(function() {
      resolve(rule);
    });
  })
}

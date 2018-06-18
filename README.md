# Handy workarounds for VictorOps

## rule-rep.js

This handy little hunk of javascript allows users to toggle a particular Transmog rule in their account, which is handy for silencing a particular subset of alerts without triggering global maintenance mode during deployments or known maintenance windows.

A valid username and password is required.

### Usage

Display a list of all Transmog rules for your organization, including the rule ID for each:

```javascript
getRules(organization:String, username:String, password:String)
```

Toggle the state of a rule to the opposite of it's current setting.

```javascript
toggleRule(id:Number, organization:String, username:String, password:String)
```




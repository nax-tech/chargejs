## Modules

<dl>
<dt><a href="#module_app">app</a></dt>
<dd><p>A application type module</p>
</dd>
<dt><a href="#module_config">config</a></dt>
<dd><p>A module for config functions</p>
</dd>
<dt><a href="#module_helpers">helpers</a></dt>
<dd><p>A module for config functions</p>
</dd>
</dl>

<a name="module_app"></a>

## app
A application type module

<a name="module_app.exports.Operation"></a>

### app.exports.Operation
Operation Class handles outputs for app layer

**Kind**: static class of [<code>app</code>](#module_app)  
<a name="module_config"></a>

## config
A module for config functions


* [config](#module_config)
    * [.exports.getRedisPrefix(environment, app)](#module_config.exports.getRedisPrefix) ⇒ <code>string</code>
    * [.exports.certs(ev)](#module_config.exports.certs) ⇒ <code>object</code>
    * [.exports.redisConf(config, env, app)](#module_config.exports.redisConf) ⇒ <code>object</code>

<a name="module_config.exports.getRedisPrefix"></a>

### config.exports.getRedisPrefix(environment, app) ⇒ <code>string</code>
Gets the allowed prefix for redis

**Kind**: static method of [<code>config</code>](#module_config)  
**Returns**: <code>string</code> - string value with concat of environment:app  
**Throws**:

- Will throw an error if the environment or app are incorrect


| Param | Type | Description |
| --- | --- | --- |
| environment | <code>string</code> | the environment the app is running, ex: development, dev, stage, production |
| app | <code>string</code> | the app. This refers to the package, payments, identity |

<a name="module_config.exports.certs"></a>

### config.exports.certs(ev) ⇒ <code>object</code>
Reads the ca and cert for runtime decryption. Expects files in /app/tls/

**Kind**: static method of [<code>config</code>](#module_config)  
**Returns**: <code>object</code> - object with location of ca and cert  
**Throws**:

- Will throw an error if the environment is incorrect


| Param | Type | Description |
| --- | --- | --- |
| ev | <code>string</code> | the environment the app is running, ex: development, dev, stage, production |

<a name="module_config.exports.redisConf"></a>

### config.exports.redisConf(config, env, app) ⇒ <code>object</code>
Sets up the common redis config object

**Kind**: static method of [<code>config</code>](#module_config)  
**Returns**: <code>object</code> - object with location of ca and cert  
**Throws**:

- Will throw an error if the  is incorrect


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | the object with redis host and port |
| env | <code>string</code> | the environment the app is running, ex: development, dev, stage, production |
| app | <code>string</code> | the app. This refers to the package, payments, identity |

<a name="module_helpers"></a>

## helpers
A module for config functions

<a name="module_helpers.CustomException"></a>

### helpers.CustomException(message, code) ⇒ <code>Error</code>
Extend the Error object

**Kind**: static method of [<code>helpers</code>](#module_helpers)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | the message for the exception |
| code | <code>string</code> | the code for the exception |


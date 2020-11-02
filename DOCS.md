## Modules

<dl>
<dt><a href="#module_app">app</a></dt>
<dd><p>A application type module</p>
</dd>
<dt><a href="#module_config">config</a></dt>
<dd><p>A module for config functions</p>
</dd>
<dt><a href="#module_domain">domain</a></dt>
<dd><p>A domain type module</p>
</dd>
<dt><a href="#module_helpers">helpers</a></dt>
<dd><p>A module for config functions</p>
</dd>
<dt><a href="#module_infra">infra</a></dt>
<dd><p>A infra type module</p>
</dd>
<dt><a href="#module_interface">interface</a></dt>
<dd><p>A module for common interfaces</p>
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
    * _static_
        * [.exports.getRedisPrefix(environment, app)](#module_config.exports.getRedisPrefix) ⇒ <code>string</code>
        * [.exports.certs(ev)](#module_config.exports.certs) ⇒ <code>object</code>
        * [.exports.redisConf(config, env, app)](#module_config.exports.redisConf) ⇒ [<code>redis.config</code>](#external_redis.config)
        * [.exports.logging(env, app)](#module_config.exports.logging) ⇒ [<code>winston.config</code>](#external_winston.config)
    * _inner_
        * [~winston.config](#external_winston.config)
        * [~redis.config](#external_redis.config)

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

### config.exports.redisConf(config, env, app) ⇒ [<code>redis.config</code>](#external_redis.config)
Sets up the common redis config object
time out is 1000 * 60 * 60
connection attempts > 10
reconnect after attempts * 100 every 3000ms

**Kind**: static method of [<code>config</code>](#module_config)  
**Returns**: [<code>redis.config</code>](#external_redis.config) - the redis configuration object  
**Throws**:

- Will throw an error if the connection fails


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | the object with redis host and port |
| env | <code>string</code> | the environment the app is running, ex: development, dev, stage, production |
| app | <code>string</code> | the app. This refers to the package, payments, identity |

<a name="module_config.exports.logging"></a>

### config.exports.logging(env, app) ⇒ [<code>winston.config</code>](#external_winston.config)
Get the Winston configuration object https://github.com/winstonjs/winston#readme

**Kind**: static method of [<code>config</code>](#module_config)  
**Returns**: [<code>winston.config</code>](#external_winston.config) - the winston configuration object  

| Param | Type | Description |
| --- | --- | --- |
| env | <code>string</code> | the environment the app is running, ex: development, dev, stage, production |
| app | <code>string</code> | the app. This refers to the package, payments, identity |

<a name="external_winston.config"></a>

### config~winston.config
The winston config object

**Kind**: inner external of [<code>config</code>](#module_config)  
**See**: [https://github.com/winstonjs/winston#creating-your-own-logger](https://github.com/winstonjs/winston#creating-your-own-logger)  
<a name="external_redis.config"></a>

### config~redis.config
The redis config object

**Kind**: inner external of [<code>config</code>](#module_config)  
**See**: [https://github.com/NodeRedis/node-redis#rediscreateclient](https://github.com/NodeRedis/node-redis#rediscreateclient)  
<a name="module_domain"></a>

## domain
A domain type module


* [domain](#module_domain)
    * [.BaseDomain](#module_domain.BaseDomain)
        * [new BaseDomain()](#new_module_domain.BaseDomain_new)
        * [.BaseDomain#addUserId(id)](#module_domain.BaseDomain.BaseDomain+addUserId) ⇒ <code>void</code>
        * [.BaseDomain#setMasked(number)](#module_domain.BaseDomain.BaseDomain+setMasked)
        * [.BaseDomain#sanitize(fields)](#module_domain.BaseDomain.BaseDomain+sanitize) ⇒ <code>object</code>
        * [.BaseDomain#setMeta()](#module_domain.BaseDomain.BaseDomain+setMeta) ⇒ <code>object</code>

<a name="module_domain.BaseDomain"></a>

### domain.BaseDomain
**Kind**: static class of [<code>domain</code>](#module_domain)  

* [.BaseDomain](#module_domain.BaseDomain)
    * [new BaseDomain()](#new_module_domain.BaseDomain_new)
    * [.BaseDomain#addUserId(id)](#module_domain.BaseDomain.BaseDomain+addUserId) ⇒ <code>void</code>
    * [.BaseDomain#setMasked(number)](#module_domain.BaseDomain.BaseDomain+setMasked)
    * [.BaseDomain#sanitize(fields)](#module_domain.BaseDomain.BaseDomain+sanitize) ⇒ <code>object</code>
    * [.BaseDomain#setMeta()](#module_domain.BaseDomain.BaseDomain+setMeta) ⇒ <code>object</code>

<a name="new_module_domain.BaseDomain_new"></a>

#### new BaseDomain()
Creates an domain layer Base class

<a name="module_domain.BaseDomain.BaseDomain+addUserId"></a>

#### BaseDomain.BaseDomain#addUserId(id) ⇒ <code>void</code>
add userId

**Kind**: static method of [<code>BaseDomain</code>](#module_domain.BaseDomain)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | user uuid |

<a name="module_domain.BaseDomain.BaseDomain+setMasked"></a>

#### BaseDomain.BaseDomain#setMasked(number)
Sets the masked field by x'ing out all digits except last 4

**Kind**: static method of [<code>BaseDomain</code>](#module_domain.BaseDomain)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| number | <code>string</code> | <code>&quot;1234567890&quot;</code> | the account number as a string |

<a name="module_domain.BaseDomain.BaseDomain+sanitize"></a>

#### BaseDomain.BaseDomain#sanitize(fields) ⇒ <code>object</code>
sanitizes an object with values to update to prevent updating
a value that is not allowed to be updated

**Kind**: static method of [<code>BaseDomain</code>](#module_domain.BaseDomain)  

| Param | Type | Description |
| --- | --- | --- |
| fields | <code>object</code> | the object with the fields to update |

<a name="module_domain.BaseDomain.BaseDomain+setMeta"></a>

#### BaseDomain.BaseDomain#setMeta() ⇒ <code>object</code>
sets the meta field

**Kind**: static method of [<code>BaseDomain</code>](#module_domain.BaseDomain)  
<a name="module_helpers"></a>

## helpers
A module for config functions

<a name="module_helpers.CustomException"></a>

### helpers.CustomException(message, code) ⇒ <code>Error</code>
Extend the Error object

**Kind**: static method of [<code>helpers</code>](#module_helpers)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> | <code>&quot;undefined exception&quot;</code> | the message for the exception |
| code | <code>string</code> | <code>&quot;undefined code&quot;</code> | the code for the exception |

<a name="module_infra"></a>

## infra
A infra type module


* [infra](#module_infra)
    * _static_
        * [.logFormat()](#module_infra.logFormat) ⇒ [<code>winston.format</code>](#external_winston.format)
        * [.exports.LoggerStreamAdapter(env)](#module_infra.exports.LoggerStreamAdapter) ⇒ [<code>winston.transport</code>](#external_winston.transport)
        * [.exports.ModelLoader()](#module_infra.exports.ModelLoader) ⇒ [<code>sequelize.loaded</code>](#external_sequelize.loaded)
    * _inner_
        * [~winston.transport](#external_winston.transport)
        * [~winston.format](#external_winston.format)
        * [~winston.transport](#external_winston.transport)
        * [~sequelize.loaded](#external_sequelize.loaded)

<a name="module_infra.logFormat"></a>

### infra.logFormat() ⇒ [<code>winston.format</code>](#external_winston.format)
Creates winston format object

**Kind**: static method of [<code>infra</code>](#module_infra)  
**Returns**: [<code>winston.format</code>](#external_winston.format) - the winston format object  
<a name="module_infra.exports.LoggerStreamAdapter"></a>

### infra.exports.LoggerStreamAdapter(env) ⇒ [<code>winston.transport</code>](#external_winston.transport)
Creates winston transport namespaced to environment

**Kind**: static method of [<code>infra</code>](#module_infra)  
**Returns**: [<code>winston.transport</code>](#external_winston.transport) - the winston transport object  

| Param | Type | Description |
| --- | --- | --- |
| env | <code>string</code> | the environment the app is running, ex: development, dev, stage, production |

<a name="module_infra.exports.ModelLoader"></a>

### infra.exports.ModelLoader() ⇒ [<code>sequelize.loaded</code>](#external_sequelize.loaded)
Creates winston transport namespaced to environment

**Kind**: static method of [<code>infra</code>](#module_infra)  
**Returns**: [<code>sequelize.loaded</code>](#external_sequelize.loaded) - the sequelize loaded model object  
<a name="external_winston.transport"></a>

### infra~winston.transport
The winston transport object

**Kind**: inner external of [<code>infra</code>](#module_infra)  
**See**: [https://github.com/winstonjs/winston#readme](https://github.com/winstonjs/winston#readme)  
<a name="external_winston.format"></a>

### infra~winston.format
The winston format object

**Kind**: inner external of [<code>infra</code>](#module_infra)  
**See**: [https://github.com/winstonjs/winston#readme](https://github.com/winstonjs/winston#readme)  
<a name="external_winston.transport"></a>

### infra~winston.transport
The winston transport object

**Kind**: inner external of [<code>infra</code>](#module_infra)  
**See**: [https://github.com/winstonjs/winston#readme](https://github.com/winstonjs/winston#readme)  
<a name="external_sequelize.loaded"></a>

### infra~sequelize.loaded
The sequelize loaded model object

**Kind**: inner external of [<code>infra</code>](#module_infra)  
**See**: [https://sequelize.org/](https://sequelize.org/)  
<a name="module_interface"></a>

## interface
A module for common interfaces


* [interface](#module_interface)
    * _static_
        * [.exports.Server](#module_interface.exports.Server)
        * [.exports.standardError](#module_interface.exports.standardError) ⇒ <code>Error</code>
        * [.exports.devErrorHandler](#module_interface.exports.devErrorHandler) ⇒ [<code>express.res</code>](#external_express.res)
        * [.exports.deviceMiddleware](#module_interface.exports.deviceMiddleware) ⇒ <code>void</code>
        * [.exports.notFoundErrorHandler](#module_interface.exports.notFoundErrorHandler) ⇒ [<code>express.res</code>](#external_express.res)
        * [.exports.validate](#module_interface.exports.validate) ⇒ [<code>express.res</code>](#external_express.res)
        * [.exports.originEncoder](#module_interface.exports.originEncoder) ⇒ <code>string</code>
        * [.exports.originDecoder](#module_interface.exports.originDecoder) ⇒ <code>void</code>
        * [.exports.createControllerRoutes](#module_interface.exports.createControllerRoutes) ⇒ [<code>express.res</code>](#external_express.res)
    * _inner_
        * [~Server](#module_interface..Server)
            * [new Server(input)](#new_module_interface..Server_new)
        * [~ErrorInfo](#module_interface..ErrorInfo) : <code>Object</code>
        * [~express.req](#external_express.req)
        * [~express.res](#external_express.res)
        * [~express.err](#external_express.err)
        * [~express.next](#external_express.next)
        * [~express.router](#external_express.router)

<a name="module_interface.exports.Server"></a>

### interface.exports.Server
Server class

**Kind**: static class of [<code>interface</code>](#module_interface)  
<a name="module_interface.exports.standardError"></a>

### interface.exports.standardError ⇒ <code>Error</code>
Standard error function

**Kind**: static constant of [<code>interface</code>](#module_interface)  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>Object</code> | The input object |
| input.type | <code>string</code> | The error type |
| input.message | <code>string</code> | The error message |
| input.errors | <code>Array.&lt;ErrorInfo&gt;</code> | The errors array |

<a name="module_interface.exports.devErrorHandler"></a>

### interface.exports.devErrorHandler ⇒ [<code>express.res</code>](#external_express.res)
Dev error handler

**Kind**: static constant of [<code>interface</code>](#module_interface)  
**Returns**: [<code>express.res</code>](#external_express.res) - the express res object  

| Param | Type |
| --- | --- |
| err | [<code>express.err</code>](#external_express.err) | 
| req | [<code>express.req</code>](#external_express.req) | 
| res | [<code>express.res</code>](#external_express.res) | 
| next | [<code>express.next</code>](#external_express.next) | 

<a name="module_interface.exports.deviceMiddleware"></a>

### interface.exports.deviceMiddleware ⇒ <code>void</code>
Sets device info available in req.origin for access in controllers

**Kind**: static constant of [<code>interface</code>](#module_interface)  

| Param | Type |
| --- | --- |
| req | [<code>express.req</code>](#external_express.req) | 
| res | [<code>express.res</code>](#external_express.res) | 
| next | [<code>express.next</code>](#external_express.next) | 

<a name="module_interface.exports.notFoundErrorHandler"></a>

### interface.exports.notFoundErrorHandler ⇒ [<code>express.res</code>](#external_express.res)
Not found error handler

**Kind**: static constant of [<code>interface</code>](#module_interface)  
**Returns**: [<code>express.res</code>](#external_express.res) - the express res object  

| Param | Type |
| --- | --- |
| req | [<code>express.req</code>](#external_express.req) | 
| res | [<code>express.res</code>](#external_express.res) | 
| next | [<code>express.next</code>](#external_express.next) | 

<a name="module_interface.exports.validate"></a>

### interface.exports.validate ⇒ [<code>express.res</code>](#external_express.res)
Validate request handler

**Kind**: static constant of [<code>interface</code>](#module_interface)  
**Returns**: [<code>express.res</code>](#external_express.res) - the express res object  

| Param | Type |
| --- | --- |
| req | [<code>express.req</code>](#external_express.req) | 
| res | [<code>express.res</code>](#external_express.res) | 
| next | [<code>express.next</code>](#external_express.next) | 

<a name="module_interface.exports.originEncoder"></a>

### interface.exports.originEncoder ⇒ <code>string</code>
Base64 encode an input
This is used to encode req.origin so it can be set to the header x-origin as a string
in the api-gateway proxy for a given request

**Kind**: static constant of [<code>interface</code>](#module_interface)  

| Param | Type | Description |
| --- | --- | --- |
| origin | <code>object</code> | the req.origin object to encode |

<a name="module_interface.exports.originDecoder"></a>

### interface.exports.originDecoder ⇒ <code>void</code>
Base64 decode the x-origin header and set it to req.origin
This is used to decode the encoded header coming from the api-gateway

**Kind**: static constant of [<code>interface</code>](#module_interface)  

| Param | Type |
| --- | --- |
| req | [<code>express.req</code>](#external_express.req) | 
| res | [<code>express.res</code>](#external_express.res) | 
| next | [<code>express.next</code>](#external_express.next) | 

<a name="module_interface.exports.createControllerRoutes"></a>

### interface.exports.createControllerRoutes ⇒ [<code>express.res</code>](#external_express.res)
Creates a controller path for the router

**Kind**: static constant of [<code>interface</code>](#module_interface)  
**Returns**: [<code>express.res</code>](#external_express.res) - the express res object  

| Param | Type | Description |
| --- | --- | --- |
| controllerUri | <code>string</code> | the path to the controller |

<a name="module_interface..Server"></a>

### interface~Server
**Kind**: inner class of [<code>interface</code>](#module_interface)  
<a name="new_module_interface..Server_new"></a>

#### new Server(input)
starts the server based on environment

**Returns**: [<code>express.router</code>](#external_express.router) - the express router object  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>Object</code> | The input object as injected by src/container.js |
| input.config | <code>Object</code> | The config object |
| input.logger | <code>Object</code> | The logger function |

<a name="module_interface..ErrorInfo"></a>

### interface~ErrorInfo : <code>Object</code>
**Kind**: inner typedef of [<code>interface</code>](#module_interface)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| param | <code>string</code> | The error param name |
| msg | <code>string</code> | The error message |
| location | <code>string</code> | The error location |

<a name="external_express.req"></a>

### interface~express.req
The express request object

**Kind**: inner external of [<code>interface</code>](#module_interface)  
**See**: [https://github.com/expressjs/express/blob/master/lib/request.js](https://github.com/expressjs/express/blob/master/lib/request.js)  
<a name="external_express.res"></a>

### interface~express.res
The express response object

**Kind**: inner external of [<code>interface</code>](#module_interface)  
**See**: [https://github.com/expressjs/express/blob/master/lib/response.js](https://github.com/expressjs/express/blob/master/lib/response.js)  
<a name="external_express.err"></a>

### interface~express.err
The express err object

**Kind**: inner external of [<code>interface</code>](#module_interface)  
**See**: [https://github.com/expressjs/express/blob/master/lib/router/index.js](https://github.com/expressjs/express/blob/master/lib/router/index.js)  
<a name="external_express.next"></a>

### interface~express.next
The express next object

**Kind**: inner external of [<code>interface</code>](#module_interface)  
**See**: [https://github.com/expressjs/express/blob/master/lib/router/index.js](https://github.com/expressjs/express/blob/master/lib/router/index.js)  
<a name="external_express.router"></a>

### interface~express.router
The express router object

**Kind**: inner external of [<code>interface</code>](#module_interface)  
**See**: [https://github.com/expressjs/express/blob/master/lib/router/index.js](https://github.com/expressjs/express/blob/master/lib/router/index.js)  

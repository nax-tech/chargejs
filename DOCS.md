<a name="module_redis"></a>

## redis
A module for handling redis functionality

<a name="module_redis.exports.getPrefix"></a>

### redis.exports.getPrefix(environment, app) ⇒ <code>string</code>
Gets the allowed prefix for redis

**Kind**: static method of [<code>redis</code>](#module_redis)  
**Returns**: <code>string</code> - string value with concat of environment:app  
**Throws**:

- Will throw an error if the environment or app are incorrect. This will crash the app


| Param | Type | Description |
| --- | --- | --- |
| environment | <code>string</code> | the environment the app is running, ex: development, dev, stage, production |
| app | <code>string</code> | the app. This refers to the package, payments, identity |


import { __extends } from "tslib";
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import { InternalAPIClass } from './internals/InternalAPI';
var logger = new Logger('API');
/**
 * @deprecated
 * Use RestApi or GraphQLAPI to reduce your application bundle size
 * Export Cloud Logic APIs
 */
var APIClass = /** @class */ (function (_super) {
    __extends(APIClass, _super);
    function APIClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    APIClass.prototype.getModuleName = function () {
        return 'API';
    };
    APIClass.prototype.graphql = function (options, additionalHeaders) {
        return _super.prototype.graphql.call(this, options, additionalHeaders);
    };
    return APIClass;
}(InternalAPIClass));
export { APIClass };
export var API = new APIClass(null);
Amplify.register(API);
//# sourceMappingURL=API.js.map
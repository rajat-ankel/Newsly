import { __assign } from "tslib";
import { ConsoleLogger as Logger, } from '@aws-amplify/core';
var logger = new Logger('AbstractPubSubProvider');
var AbstractPubSubProvider = /** @class */ (function () {
    function AbstractPubSubProvider(options) {
        this._config = options;
    }
    AbstractPubSubProvider.prototype.configure = function (config) {
        this._config = __assign(__assign({}, config), this._config);
        logger.debug("configure " + this.getProviderName(), this._config);
        return this.options;
    };
    AbstractPubSubProvider.prototype.getCategory = function () {
        return 'PubSub';
    };
    Object.defineProperty(AbstractPubSubProvider.prototype, "options", {
        get: function () {
            return __assign({}, this._config);
        },
        enumerable: true,
        configurable: true
    });
    return AbstractPubSubProvider;
}());
export { AbstractPubSubProvider };
//# sourceMappingURL=PubSubProvider.js.map
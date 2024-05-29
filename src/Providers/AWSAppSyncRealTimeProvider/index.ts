import { __assign, __awaiter, __extends, __generator, __read } from "tslib";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Observable from 'zen-observable-ts';
import { GraphQLError } from 'graphql';
import * as url from 'url';
import { v4 as uuid } from 'uuid';
import { Buffer } from 'buffer';
import { Logger, Credentials, Signer, Hub, USER_AGENT_HEADER, jitteredExponentialRetry, NonRetryableError, isNonRetryableError, getAmplifyUserAgent, } from '@aws-amplify/core';
import { Cache } from '@aws-amplify/cache';
import { Auth } from '@aws-amplify/auth';
import { AbstractPubSubProvider } from '../PubSubProvider';
import { CONTROL_MSG, ConnectionState, } from '../../types/PubSub';
import { AMPLIFY_SYMBOL, AWS_APPSYNC_REALTIME_HEADERS, CONNECTION_INIT_TIMEOUT, DEFAULT_KEEP_ALIVE_TIMEOUT, DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT, MAX_DELAY_MS, MESSAGE_TYPES, NON_RETRYABLE_CODES, SOCKET_STATUS, START_ACK_TIMEOUT, SUBSCRIPTION_STATUS, CONNECTION_STATE_CHANGE, } from '../constants';
import { ConnectionStateMonitor, CONNECTION_CHANGE, } from '../../utils/ConnectionStateMonitor';
import { ReconnectEvent, ReconnectionMonitor, } from '../../utils/ReconnectionMonitor';
var logger = new Logger('AWSAppSyncRealTimeProvider');
var dispatchApiEvent = function (event, data, message) {
    Hub.dispatch('api', { event: event, data: data, message: message }, 'PubSub', AMPLIFY_SYMBOL);
};
var standardDomainPattern = /^https:\/\/\w{26}\.appsync\-api\.\w{2}(?:(?:\-\w{2,})+)\-\d\.amazonaws.com(?:\.cn)?\/graphql$/i;
var customDomainPath = '/realtime';
var AWSAppSyncRealTimeProvider = /** @class */ (function (_super) {
    __extends(AWSAppSyncRealTimeProvider, _super);
    function AWSAppSyncRealTimeProvider(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.socketStatus = SOCKET_STATUS.CLOSED;
        _this.keepAliveTimeout = DEFAULT_KEEP_ALIVE_TIMEOUT;
        _this.subscriptionObserverMap = new Map();
        _this.promiseArray = [];
        _this.connectionStateMonitor = new ConnectionStateMonitor();
        _this.reconnectionMonitor = new ReconnectionMonitor();
        // Monitor the connection state and pass changes along to Hub
        _this.connectionStateMonitorSubscription =
            _this.connectionStateMonitor.connectionStateObservable.subscribe(function (connectionState) {
                dispatchApiEvent(CONNECTION_STATE_CHANGE, {
                    provider: _this,
                    connectionState: connectionState,
                }, "Connection state is " + connectionState);
                _this.connectionState = connectionState;
                // Trigger START_RECONNECT when the connection is disrupted
                if (connectionState === ConnectionState.ConnectionDisrupted) {
                    _this.reconnectionMonitor.record(ReconnectEvent.START_RECONNECT);
                }
                // Trigger HALT_RECONNECT to halt reconnection attempts when the state is anything other than
                //   ConnectionDisrupted or Connecting
                if ([
                    ConnectionState.Connected,
                    ConnectionState.ConnectedPendingDisconnect,
                    ConnectionState.ConnectedPendingKeepAlive,
                    ConnectionState.ConnectedPendingNetwork,
                    ConnectionState.ConnectionDisruptedPendingNetwork,
                    ConnectionState.Disconnected,
                ].includes(connectionState)) {
                    _this.reconnectionMonitor.record(ReconnectEvent.HALT_RECONNECT);
                }
            });
        return _this;
    }
    /**
     * Mark the socket closed and release all active listeners
     */
    AWSAppSyncRealTimeProvider.prototype.close = function () {
        // Mark the socket closed both in status and the connection monitor
        this.socketStatus = SOCKET_STATUS.CLOSED;
        this.connectionStateMonitor.record(CONNECTION_CHANGE.CONNECTION_FAILED);
        // Turn off the subscription monitor Hub publishing
        this.connectionStateMonitorSubscription.unsubscribe();
        // Complete all reconnect observers
        this.reconnectionMonitor.close();
    };
    AWSAppSyncRealTimeProvider.prototype.getNewWebSocket = function (url, protocol) {
        return new WebSocket(url, protocol);
    };
    AWSAppSyncRealTimeProvider.prototype.getProviderName = function () {
        return 'AWSAppSyncRealTimeProvider';
    };
    AWSAppSyncRealTimeProvider.prototype.newClient = function () {
        throw new Error('Not used here');
    };
    AWSAppSyncRealTimeProvider.prototype.publish = function (_topics, _msg, _options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Operation not supported');
            });
        });
    };
    // Check if url matches standard domain pattern
    AWSAppSyncRealTimeProvider.prototype.isCustomDomain = function (url) {
        return url.match(standardDomainPattern) === null;
    };
    AWSAppSyncRealTimeProvider.prototype.subscribe = function (_topics, options, customUserAgentDetails) {
        var _this = this;
        var appSyncGraphqlEndpoint = options === null || options === void 0 ? void 0 : options.appSyncGraphqlEndpoint;
        return new Observable(function (observer) {
            if (!options || !appSyncGraphqlEndpoint) {
                observer.error({
                    errors: [
                        __assign({}, new GraphQLError("Subscribe only available for AWS AppSync endpoint")),
                    ],
                });
                observer.complete();
            }
            else {
                var subscriptionStartActive_1 = false;
                var subscriptionId_1 = uuid();
                var startSubscription_1 = function () {
                    if (!subscriptionStartActive_1) {
                        subscriptionStartActive_1 = true;
                        var startSubscriptionPromise = _this._startSubscriptionWithAWSAppSyncRealTime({
                            options: options,
                            observer: observer,
                            subscriptionId: subscriptionId_1,
                            customUserAgentDetails: customUserAgentDetails,
                        }).catch(function (err) {
                            logger.debug(CONTROL_MSG.REALTIME_SUBSCRIPTION_INIT_ERROR + ": " + err);
                            _this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
                        });
                        startSubscriptionPromise.finally(function () {
                            subscriptionStartActive_1 = false;
                        });
                    }
                };
                var reconnectSubscription_1;
                // Add an observable to the reconnection list to manage reconnection for this subscription
                reconnectSubscription_1 = new Observable(function (observer) {
                    _this.reconnectionMonitor.addObserver(observer);
                }).subscribe(function () {
                    startSubscription_1();
                });
                startSubscription_1();
                return function () { return __awaiter(_this, void 0, void 0, function () {
                    var subscriptionState, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                // Cleanup reconnection subscription
                                reconnectSubscription_1 === null || reconnectSubscription_1 === void 0 ? void 0 : reconnectSubscription_1.unsubscribe();
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, 4, 5]);
                                // Waiting that subscription has been connected before trying to unsubscribe
                                return [4 /*yield*/, this._waitForSubscriptionToBeConnected(subscriptionId_1)];
                            case 2:
                                // Waiting that subscription has been connected before trying to unsubscribe
                                _a.sent();
                                subscriptionState = (this.subscriptionObserverMap.get(subscriptionId_1) || {}).subscriptionState;
                                if (!subscriptionState) {
                                    // subscription already unsubscribed
                                    return [2 /*return*/];
                                }
                                if (subscriptionState === SUBSCRIPTION_STATUS.CONNECTED) {
                                    this._sendUnsubscriptionMessage(subscriptionId_1);
                                }
                                else {
                                    throw new Error('Subscription never connected');
                                }
                                return [3 /*break*/, 5];
                            case 3:
                                err_1 = _a.sent();
                                logger.debug("Error while unsubscribing " + err_1);
                                return [3 /*break*/, 5];
                            case 4:
                                this._removeSubscriptionObserver(subscriptionId_1);
                                return [7 /*endfinally*/];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); };
            }
        });
    };
    Object.defineProperty(AWSAppSyncRealTimeProvider.prototype, "isSSLEnabled", {
        get: function () {
            return !this.options['aws_appsync_dangerously_connect_to_http_endpoint_for_testing'];
        },
        enumerable: true,
        configurable: true
    });
    AWSAppSyncRealTimeProvider.prototype._startSubscriptionWithAWSAppSyncRealTime = function (_a) {
        var options = _a.options, observer = _a.observer, subscriptionId = _a.subscriptionId, customUserAgentDetails = _a.customUserAgentDetails;
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var appSyncGraphqlEndpoint, authenticationType, query, variables, apiKey, region, _c, graphql_headers, _d, additionalHeaders, subscriptionState, data, dataString, headerObj, _e, _f, subscriptionMessage, stringToAWSRealTime, err_2, _g, subscriptionFailedCallback, subscriptionReadyCallback;
            var _h;
            var _this = this;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        appSyncGraphqlEndpoint = options.appSyncGraphqlEndpoint, authenticationType = options.authenticationType, query = options.query, variables = options.variables, apiKey = options.apiKey, region = options.region, _c = options.graphql_headers, graphql_headers = _c === void 0 ? function () { return ({}); } : _c, _d = options.additionalHeaders, additionalHeaders = _d === void 0 ? {} : _d;
                        subscriptionState = SUBSCRIPTION_STATUS.PENDING;
                        data = {
                            query: query,
                            variables: variables,
                        };
                        // Having a subscription id map will make it simple to forward messages received
                        this.subscriptionObserverMap.set(subscriptionId, {
                            observer: observer,
                            query: query !== null && query !== void 0 ? query : '',
                            variables: variables !== null && variables !== void 0 ? variables : {},
                            subscriptionState: subscriptionState,
                            startAckTimeoutId: undefined,
                        });
                        dataString = JSON.stringify(data);
                        _e = [{}];
                        return [4 /*yield*/, this._awsRealTimeHeaderBasedAuth({
                                apiKey: apiKey,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                authenticationType: authenticationType,
                                payload: dataString,
                                canonicalUri: '',
                                region: region,
                                additionalHeaders: additionalHeaders,
                            })];
                    case 1:
                        _f = [__assign.apply(void 0, _e.concat([(_j.sent())]))];
                        return [4 /*yield*/, graphql_headers()];
                    case 2:
                        headerObj = __assign.apply(void 0, [__assign.apply(void 0, [__assign.apply(void 0, _f.concat([(_j.sent())])), additionalHeaders]), (_h = {}, _h[USER_AGENT_HEADER] = getAmplifyUserAgent(customUserAgentDetails), _h)]);
                        subscriptionMessage = {
                            id: subscriptionId,
                            payload: {
                                data: dataString,
                                extensions: {
                                    authorization: __assign({}, headerObj),
                                },
                            },
                            type: MESSAGE_TYPES.GQL_START,
                        };
                        stringToAWSRealTime = JSON.stringify(subscriptionMessage);
                        _j.label = 3;
                    case 3:
                        _j.trys.push([3, 5, , 6]);
                        this.connectionStateMonitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
                        return [4 /*yield*/, this._initializeWebSocketConnection({
                                apiKey: apiKey,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                authenticationType: authenticationType,
                                region: region,
                                additionalHeaders: additionalHeaders,
                            })];
                    case 4:
                        _j.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _j.sent();
                        this._logStartSubscriptionError(subscriptionId, observer, err_2);
                        return [2 /*return*/];
                    case 6:
                        _g = (_b = this.subscriptionObserverMap.get(subscriptionId)) !== null && _b !== void 0 ? _b : {}, subscriptionFailedCallback = _g.subscriptionFailedCallback, subscriptionReadyCallback = _g.subscriptionReadyCallback;
                        // This must be done before sending the message in order to be listening immediately
                        this.subscriptionObserverMap.set(subscriptionId, {
                            observer: observer,
                            subscriptionState: subscriptionState,
                            query: query !== null && query !== void 0 ? query : '',
                            variables: variables !== null && variables !== void 0 ? variables : {},
                            subscriptionReadyCallback: subscriptionReadyCallback,
                            subscriptionFailedCallback: subscriptionFailedCallback,
                            startAckTimeoutId: setTimeout(function () {
                                _this._timeoutStartSubscriptionAck.call(_this, subscriptionId);
                            }, START_ACK_TIMEOUT),
                        });
                        if (this.awsRealTimeSocket) {
                            this.awsRealTimeSocket.send(stringToAWSRealTime);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Log logic for start subscription failures
    AWSAppSyncRealTimeProvider.prototype._logStartSubscriptionError = function (subscriptionId, observer, err) {
        var _a;
        logger.debug({ err: err });
        var message = String((_a = err.message) !== null && _a !== void 0 ? _a : '');
        // Resolving to give the state observer time to propogate the update
        Promise.resolve(this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED));
        // Capture the error only when the network didn't cause disruption
        if (this.connectionState !== ConnectionState.ConnectionDisruptedPendingNetwork) {
            // When the error is non-retriable, error out the observable
            if (isNonRetryableError(err)) {
                observer.error({
                    errors: [
                        __assign({}, new GraphQLError(CONTROL_MSG.CONNECTION_FAILED + ": " + message)),
                    ],
                });
            }
            else {
                logger.debug(CONTROL_MSG.CONNECTION_FAILED + ": " + message);
            }
            var subscriptionFailedCallback = (this.subscriptionObserverMap.get(subscriptionId) || {}).subscriptionFailedCallback;
            // Notify concurrent unsubscription
            if (typeof subscriptionFailedCallback === 'function') {
                subscriptionFailedCallback();
            }
        }
    };
    // Waiting that subscription has been connected before trying to unsubscribe
    AWSAppSyncRealTimeProvider.prototype._waitForSubscriptionToBeConnected = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionObserver, subscriptionState;
            var _this = this;
            return __generator(this, function (_a) {
                subscriptionObserver = this.subscriptionObserverMap.get(subscriptionId);
                if (subscriptionObserver) {
                    subscriptionState = subscriptionObserver.subscriptionState;
                    // This in case unsubscribe is invoked before sending start subscription message
                    if (subscriptionState === SUBSCRIPTION_STATUS.PENDING) {
                        return [2 /*return*/, new Promise(function (res, rej) {
                                var observer = subscriptionObserver.observer, subscriptionState = subscriptionObserver.subscriptionState, variables = subscriptionObserver.variables, query = subscriptionObserver.query;
                                _this.subscriptionObserverMap.set(subscriptionId, {
                                    observer: observer,
                                    subscriptionState: subscriptionState,
                                    variables: variables,
                                    query: query,
                                    subscriptionReadyCallback: res,
                                    subscriptionFailedCallback: rej,
                                });
                            })];
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._sendUnsubscriptionMessage = function (subscriptionId) {
        try {
            if (this.awsRealTimeSocket &&
                this.awsRealTimeSocket.readyState === WebSocket.OPEN &&
                this.socketStatus === SOCKET_STATUS.READY) {
                // Preparing unsubscribe message to stop receiving messages for that subscription
                var unsubscribeMessage = {
                    id: subscriptionId,
                    type: MESSAGE_TYPES.GQL_STOP,
                };
                var stringToAWSRealTime = JSON.stringify(unsubscribeMessage);
                this.awsRealTimeSocket.send(stringToAWSRealTime);
            }
        }
        catch (err) {
            // If GQL_STOP is not sent because of disconnection issue, then there is nothing the client can do
            logger.debug({ err: err });
        }
    };
    AWSAppSyncRealTimeProvider.prototype._removeSubscriptionObserver = function (subscriptionId) {
        this.subscriptionObserverMap.delete(subscriptionId);
        // Verifying 1000ms after removing subscription in case there are new subscription unmount/mount
        setTimeout(this._closeSocketIfRequired.bind(this), 1000);
    };
    AWSAppSyncRealTimeProvider.prototype._closeSocketIfRequired = function () {
        if (this.subscriptionObserverMap.size > 0) {
            // Active subscriptions on the WebSocket
            return;
        }
        if (!this.awsRealTimeSocket) {
            this.socketStatus = SOCKET_STATUS.CLOSED;
            return;
        }
        this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSING_CONNECTION);
        if (this.awsRealTimeSocket.bufferedAmount > 0) {
            // Still data on the WebSocket
            setTimeout(this._closeSocketIfRequired.bind(this), 1000);
        }
        else {
            logger.debug('closing WebSocket...');
            if (this.keepAliveTimeoutId) {
                clearTimeout(this.keepAliveTimeoutId);
            }
            if (this.keepAliveAlertTimeoutId) {
                clearTimeout(this.keepAliveAlertTimeoutId);
            }
            var tempSocket = this.awsRealTimeSocket;
            // Cleaning callbacks to avoid race condition, socket still exists
            tempSocket.onclose = null;
            tempSocket.onerror = null;
            tempSocket.close(1000);
            this.awsRealTimeSocket = undefined;
            this.socketStatus = SOCKET_STATUS.CLOSED;
            this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
        }
    };
    AWSAppSyncRealTimeProvider.prototype._handleIncomingSubscriptionMessage = function (message) {
        var _this = this;
        if (typeof message.data !== 'string') {
            return;
        }
        logger.debug("subscription message from AWS AppSync RealTime: " + message.data);
        var _a = JSON.parse(String(message.data)), _b = _a.id, id = _b === void 0 ? '' : _b, payload = _a.payload, type = _a.type;
        var _c = this.subscriptionObserverMap.get(id) || {}, _d = _c.observer, observer = _d === void 0 ? null : _d, _e = _c.query, query = _e === void 0 ? '' : _e, _f = _c.variables, variables = _f === void 0 ? {} : _f, startAckTimeoutId = _c.startAckTimeoutId, subscriptionReadyCallback = _c.subscriptionReadyCallback, subscriptionFailedCallback = _c.subscriptionFailedCallback;
        logger.debug({ id: id, observer: observer, query: query, variables: variables });
        if (type === MESSAGE_TYPES.GQL_DATA && payload && payload.data) {
            if (observer) {
                observer.next(payload);
            }
            else {
                logger.debug("observer not found for id: " + id);
            }
            return;
        }
        if (type === MESSAGE_TYPES.GQL_START_ACK) {
            logger.debug("subscription ready for " + JSON.stringify({ query: query, variables: variables }));
            if (typeof subscriptionReadyCallback === 'function') {
                subscriptionReadyCallback();
            }
            if (startAckTimeoutId)
                clearTimeout(startAckTimeoutId);
            dispatchApiEvent(CONTROL_MSG.SUBSCRIPTION_ACK, { query: query, variables: variables }, 'Connection established for subscription');
            var subscriptionState = SUBSCRIPTION_STATUS.CONNECTED;
            if (observer) {
                this.subscriptionObserverMap.set(id, {
                    observer: observer,
                    query: query,
                    variables: variables,
                    startAckTimeoutId: undefined,
                    subscriptionState: subscriptionState,
                    subscriptionReadyCallback: subscriptionReadyCallback,
                    subscriptionFailedCallback: subscriptionFailedCallback,
                });
            }
            this.connectionStateMonitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
            return;
        }
        if (type === MESSAGE_TYPES.GQL_CONNECTION_KEEP_ALIVE) {
            if (this.keepAliveTimeoutId)
                clearTimeout(this.keepAliveTimeoutId);
            if (this.keepAliveAlertTimeoutId)
                clearTimeout(this.keepAliveAlertTimeoutId);
            this.keepAliveTimeoutId = setTimeout(function () { return _this._errorDisconnect(CONTROL_MSG.TIMEOUT_DISCONNECT); }, this.keepAliveTimeout);
            this.keepAliveAlertTimeoutId = setTimeout(function () {
                _this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
            }, DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT);
            this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE);
            return;
        }
        if (type === MESSAGE_TYPES.GQL_ERROR) {
            var subscriptionState = SUBSCRIPTION_STATUS.FAILED;
            if (observer) {
                this.subscriptionObserverMap.set(id, {
                    observer: observer,
                    query: query,
                    variables: variables,
                    startAckTimeoutId: startAckTimeoutId,
                    subscriptionReadyCallback: subscriptionReadyCallback,
                    subscriptionFailedCallback: subscriptionFailedCallback,
                    subscriptionState: subscriptionState,
                });
                logger.debug(CONTROL_MSG.CONNECTION_FAILED + ": " + JSON.stringify(payload));
                observer.error({
                    errors: [
                        __assign({}, new GraphQLError(CONTROL_MSG.CONNECTION_FAILED + ": " + JSON.stringify(payload))),
                    ],
                });
                if (startAckTimeoutId)
                    clearTimeout(startAckTimeoutId);
                if (typeof subscriptionFailedCallback === 'function') {
                    subscriptionFailedCallback();
                }
            }
        }
    };
    AWSAppSyncRealTimeProvider.prototype._errorDisconnect = function (msg) {
        logger.debug("Disconnect error: " + msg);
        if (this.awsRealTimeSocket) {
            this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
            this.awsRealTimeSocket.close();
        }
        this.socketStatus = SOCKET_STATUS.CLOSED;
    };
    AWSAppSyncRealTimeProvider.prototype._timeoutStartSubscriptionAck = function (subscriptionId) {
        var subscriptionObserver = this.subscriptionObserverMap.get(subscriptionId);
        if (subscriptionObserver) {
            var observer = subscriptionObserver.observer, query = subscriptionObserver.query, variables = subscriptionObserver.variables;
            if (!observer) {
                return;
            }
            this.subscriptionObserverMap.set(subscriptionId, {
                observer: observer,
                query: query,
                variables: variables,
                subscriptionState: SUBSCRIPTION_STATUS.FAILED,
            });
            this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
            logger.debug('timeoutStartSubscription', JSON.stringify({ query: query, variables: variables }));
        }
    };
    AWSAppSyncRealTimeProvider.prototype._initializeWebSocketConnection = function (_a) {
        var _this = this;
        var appSyncGraphqlEndpoint = _a.appSyncGraphqlEndpoint, authenticationType = _a.authenticationType, apiKey = _a.apiKey, region = _a.region, additionalHeaders = _a.additionalHeaders;
        if (this.socketStatus === SOCKET_STATUS.READY) {
            return;
        }
        return new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
            var payloadString, authHeader, headerString, headerQs, payloadQs, discoverableEndpoint, protocol, awsRealTimeUrl, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.promiseArray.push({ res: res, rej: rej });
                        if (!(this.socketStatus === SOCKET_STATUS.CLOSED)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        this.socketStatus = SOCKET_STATUS.CONNECTING;
                        payloadString = '{}';
                        return [4 /*yield*/, this._awsRealTimeHeaderBasedAuth({
                                authenticationType: authenticationType,
                                payload: payloadString,
                                canonicalUri: '/connect',
                                apiKey: apiKey,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                region: region,
                                additionalHeaders: additionalHeaders,
                            })];
                    case 2:
                        authHeader = _a.sent();
                        headerString = authHeader ? JSON.stringify(authHeader) : '';
                        headerQs = Buffer.from(headerString).toString('base64');
                        payloadQs = Buffer.from(payloadString).toString('base64');
                        discoverableEndpoint = appSyncGraphqlEndpoint !== null && appSyncGraphqlEndpoint !== void 0 ? appSyncGraphqlEndpoint : '';
                        if (this.isCustomDomain(discoverableEndpoint)) {
                            discoverableEndpoint =
                                discoverableEndpoint.concat(customDomainPath);
                        }
                        else {
                            discoverableEndpoint = discoverableEndpoint
                                .replace('appsync-api', 'appsync-realtime-api')
                                .replace('gogi-beta', 'grt-beta');
                        }
                        protocol = this.isSSLEnabled ? 'wss://' : 'ws://';
                        discoverableEndpoint = discoverableEndpoint
                            .replace('https://', protocol)
                            .replace('http://', protocol);
                        awsRealTimeUrl = discoverableEndpoint + "?header=" + headerQs + "&payload=" + payloadQs;
                        return [4 /*yield*/, this._initializeRetryableHandshake(awsRealTimeUrl)];
                    case 3:
                        _a.sent();
                        this.promiseArray.forEach(function (_a) {
                            var res = _a.res;
                            logger.debug('Notifying connection successful');
                            res();
                        });
                        this.socketStatus = SOCKET_STATUS.READY;
                        this.promiseArray = [];
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _a.sent();
                        logger.debug('Connection exited with', err_3);
                        this.promiseArray.forEach(function (_a) {
                            var rej = _a.rej;
                            return rej(err_3);
                        });
                        this.promiseArray = [];
                        if (this.awsRealTimeSocket &&
                            this.awsRealTimeSocket.readyState === WebSocket.OPEN) {
                            this.awsRealTimeSocket.close(3001);
                        }
                        this.awsRealTimeSocket = undefined;
                        this.socketStatus = SOCKET_STATUS.CLOSED;
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    AWSAppSyncRealTimeProvider.prototype._initializeRetryableHandshake = function (awsRealTimeUrl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("Initializaling retryable Handshake");
                        return [4 /*yield*/, jitteredExponentialRetry(this._initializeHandshake.bind(this), [awsRealTimeUrl], MAX_DELAY_MS)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._initializeHandshake = function (awsRealTimeUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var err_4, _a, errorType, errorCode;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger.debug("Initializing handshake " + awsRealTimeUrl);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (function () {
                                return new Promise(function (res, rej) {
                                    var newSocket = _this.getNewWebSocket(awsRealTimeUrl, 'graphql-ws');
                                    newSocket.onerror = function () {
                                        logger.debug("WebSocket connection error");
                                    };
                                    newSocket.onclose = function () {
                                        rej(new Error('Connection handshake error'));
                                    };
                                    newSocket.onopen = function () {
                                        _this.awsRealTimeSocket = newSocket;
                                        return res();
                                    };
                                });
                            })()];
                    case 2:
                        _b.sent();
                        // Step 2: wait for ack from AWS AppSyncReaTime after sending init
                        return [4 /*yield*/, (function () {
                                return new Promise(function (res, rej) {
                                    if (_this.awsRealTimeSocket) {
                                        var ackOk_1 = false;
                                        _this.awsRealTimeSocket.onerror = function (error) {
                                            logger.debug("WebSocket error " + JSON.stringify(error));
                                        };
                                        _this.awsRealTimeSocket.onclose = function (event) {
                                            logger.debug("WebSocket closed " + event.reason);
                                            rej(new Error(JSON.stringify(event)));
                                        };
                                        _this.awsRealTimeSocket.onmessage = function (message) {
                                            if (typeof message.data !== 'string') {
                                                return;
                                            }
                                            logger.debug("subscription message from AWS AppSyncRealTime: " + message.data + " ");
                                            var data = JSON.parse(message.data);
                                            var type = data.type, _a = data.payload, _b = (_a === void 0 ? {} : _a).connectionTimeoutMs, connectionTimeoutMs = _b === void 0 ? DEFAULT_KEEP_ALIVE_TIMEOUT : _b;
                                            if (type === MESSAGE_TYPES.GQL_CONNECTION_ACK) {
                                                ackOk_1 = true;
                                                if (_this.awsRealTimeSocket) {
                                                    _this.keepAliveTimeout = connectionTimeoutMs;
                                                    _this.awsRealTimeSocket.onmessage =
                                                        _this._handleIncomingSubscriptionMessage.bind(_this);
                                                    _this.awsRealTimeSocket.onerror = function (err) {
                                                        logger.debug(err);
                                                        _this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
                                                    };
                                                    _this.awsRealTimeSocket.onclose = function (event) {
                                                        logger.debug("WebSocket closed " + event.reason);
                                                        _this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
                                                    };
                                                }
                                                res('Cool, connected to AWS AppSyncRealTime');
                                                return;
                                            }
                                            if (type === MESSAGE_TYPES.GQL_CONNECTION_ERROR) {
                                                var _c = data.payload, _d = (_c === void 0 ? {} : _c).errors, _e = __read(_d === void 0 ? [] : _d, 1), _f = _e[0], _g = _f === void 0 ? {} : _f, _h = _g.errorType, errorType = _h === void 0 ? '' : _h, _j = _g.errorCode, errorCode = _j === void 0 ? 0 : _j;
                                                rej({ errorType: errorType, errorCode: errorCode });
                                            }
                                        };
                                        var gqlInit = {
                                            type: MESSAGE_TYPES.GQL_CONNECTION_INIT,
                                        };
                                        _this.awsRealTimeSocket.send(JSON.stringify(gqlInit));
                                        var checkAckOk_1 = function (ackOk) {
                                            if (!ackOk) {
                                                _this.connectionStateMonitor.record(CONNECTION_CHANGE.CONNECTION_FAILED);
                                                rej(new Error("Connection timeout: ack from AWSAppSyncRealTime was not received after " + CONNECTION_INIT_TIMEOUT + " ms"));
                                            }
                                        };
                                        setTimeout(function () { return checkAckOk_1(ackOk_1); }, CONNECTION_INIT_TIMEOUT);
                                    }
                                });
                            })()];
                    case 3:
                        // Step 2: wait for ack from AWS AppSyncReaTime after sending init
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _b.sent();
                        _a = err_4, errorType = _a.errorType, errorCode = _a.errorCode;
                        if (NON_RETRYABLE_CODES.includes(errorCode)) {
                            throw new NonRetryableError(errorType);
                        }
                        else if (errorType) {
                            throw new Error(errorType);
                        }
                        else {
                            throw err_4;
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._awsRealTimeHeaderBasedAuth = function (_a) {
        var authenticationType = _a.authenticationType, payload = _a.payload, canonicalUri = _a.canonicalUri, appSyncGraphqlEndpoint = _a.appSyncGraphqlEndpoint, apiKey = _a.apiKey, region = _a.region, additionalHeaders = _a.additionalHeaders;
        return __awaiter(this, void 0, void 0, function () {
            var headerHandler, handler, host, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        headerHandler = {
                            API_KEY: this._awsRealTimeApiKeyHeader.bind(this),
                            AWS_IAM: this._awsRealTimeIAMHeader.bind(this),
                            OPENID_CONNECT: this._awsRealTimeOPENIDHeader.bind(this),
                            AMAZON_COGNITO_USER_POOLS: this._awsRealTimeCUPHeader.bind(this),
                            AWS_LAMBDA: this._customAuthHeader,
                        };
                        if (!(!authenticationType || !headerHandler[authenticationType])) return [3 /*break*/, 1];
                        logger.debug("Authentication type " + authenticationType + " not supported");
                        return [2 /*return*/, undefined];
                    case 1:
                        handler = headerHandler[authenticationType];
                        host = url.parse(appSyncGraphqlEndpoint !== null && appSyncGraphqlEndpoint !== void 0 ? appSyncGraphqlEndpoint : '').host;
                        logger.debug("Authenticating with " + authenticationType);
                        return [4 /*yield*/, handler({
                                payload: payload,
                                canonicalUri: canonicalUri,
                                appSyncGraphqlEndpoint: appSyncGraphqlEndpoint,
                                apiKey: apiKey,
                                region: region,
                                host: host,
                                additionalHeaders: additionalHeaders,
                            })];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._awsRealTimeCUPHeader = function (_a) {
        var host = _a.host;
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Auth.currentSession()];
                    case 1:
                        session = _b.sent();
                        return [2 /*return*/, {
                                Authorization: session.getAccessToken().getJwtToken(),
                                host: host,
                            }];
                }
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._awsRealTimeOPENIDHeader = function (_a) {
        var host = _a.host;
        return __awaiter(this, void 0, void 0, function () {
            var token, federatedInfo, currentUser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Cache.getItem('federatedInfo')];
                    case 1:
                        federatedInfo = _b.sent();
                        if (!federatedInfo) return [3 /*break*/, 2];
                        token = federatedInfo.token;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Auth.currentAuthenticatedUser()];
                    case 3:
                        currentUser = _b.sent();
                        if (currentUser) {
                            token = currentUser.token;
                        }
                        _b.label = 4;
                    case 4:
                        if (!token) {
                            throw new Error('No federated jwt');
                        }
                        return [2 /*return*/, {
                                Authorization: token,
                                host: host,
                            }];
                }
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._awsRealTimeApiKeyHeader = function (_a) {
        var apiKey = _a.apiKey, host = _a.host;
        return __awaiter(this, void 0, void 0, function () {
            var dt, dtStr;
            return __generator(this, function (_b) {
                dt = new Date();
                dtStr = dt.toISOString().replace(/[:\-]|\.\d{3}/g, '');
                return [2 /*return*/, {
                        host: host,
                        'x-amz-date': dtStr,
                        'x-api-key': apiKey,
                    }];
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._awsRealTimeIAMHeader = function (_a) {
        var payload = _a.payload, canonicalUri = _a.canonicalUri, appSyncGraphqlEndpoint = _a.appSyncGraphqlEndpoint, region = _a.region;
        return __awaiter(this, void 0, void 0, function () {
            var endpointInfo, credentialsOK, creds, request, signed_params;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        endpointInfo = {
                            region: region,
                            service: 'appsync',
                        };
                        return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _b.sent();
                        if (!credentialsOK) {
                            throw new Error('No credentials');
                        }
                        return [4 /*yield*/, Credentials.get().then(function (credentials) {
                                var _a = credentials, secretAccessKey = _a.secretAccessKey, accessKeyId = _a.accessKeyId, sessionToken = _a.sessionToken;
                                return {
                                    secret_key: secretAccessKey,
                                    access_key: accessKeyId,
                                    session_token: sessionToken,
                                };
                            })];
                    case 2:
                        creds = _b.sent();
                        request = {
                            url: "" + appSyncGraphqlEndpoint + canonicalUri,
                            data: payload,
                            method: 'POST',
                            headers: __assign({}, AWS_APPSYNC_REALTIME_HEADERS),
                        };
                        signed_params = Signer.sign(request, creds, endpointInfo);
                        return [2 /*return*/, signed_params.headers];
                }
            });
        });
    };
    AWSAppSyncRealTimeProvider.prototype._customAuthHeader = function (_a) {
        var host = _a.host, additionalHeaders = _a.additionalHeaders;
        if (!additionalHeaders || !additionalHeaders['Authorization']) {
            throw new Error('No auth token specified');
        }
        return {
            Authorization: additionalHeaders.Authorization,
            host: host,
        };
    };
    /**
     * @private
     */
    AWSAppSyncRealTimeProvider.prototype._ensureCredentials = function () {
        return Credentials.get()
            .then(function (credentials) {
            if (!credentials)
                return false;
            var cred = Credentials.shear(credentials);
            logger.debug('set credentials for AWSAppSyncRealTimeProvider', cred);
            return true;
        })
            .catch(function (err) {
            logger.warn('ensure credentials error', err);
            return false;
        });
    };
    return AWSAppSyncRealTimeProvider;
}(AbstractPubSubProvider));
export { AWSAppSyncRealTimeProvider };
//# sourceMappingURL=index.js.map
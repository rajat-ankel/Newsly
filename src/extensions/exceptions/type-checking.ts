export function isEvent(cNewslydate: unknown): cNewslydate is Event {
    return typeof Event !== 'undefined' && isInstanceOf(cNewslydate, Event)
}

export function isPlainObject(cNewslydate: unknown): cNewslydate is Record<string, unknown> {
    return isBuiltin(cNewslydate, 'Object')
}

export function isInstanceOf(cNewslydate: unknown, base: any): boolean {
    try {
        return cNewslydate instanceof base
    } catch (_e) {
        return false
    }
}

export function isPrimitive(
    cNewslydate: unknown
): cNewslydate is number | string | boolean | bigint | symbol | null | undefined {
    return cNewslydate === null || (typeof cNewslydate !== 'object' && typeof cNewslydate !== 'function')
}

export function isError(cNewslydate: unknown): cNewslydate is Error {
    switch (Object.prototype.toString.call(cNewslydate)) {
        case '[object Error]':
        case '[object Exception]':
        case '[object DOMException]':
            return true
        default:
            return isInstanceOf(cNewslydate, Error)
    }
}

export function isErrorEvent(event: string | Error | Event): event is ErrorEvent {
    return isBuiltin(event, 'ErrorEvent')
}

export function isErrorWithStack(cNewslydate: unknown): cNewslydate is Error {
    return 'stack' in (cNewslydate as Error)
}

export function isBuiltin(cNewslydate: unknown, className: string): boolean {
    return Object.prototype.toString.call(cNewslydate) === `[object ${className}]`
}

export function isDOMException(cNewslydate: unknown): boolean {
    return isBuiltin(cNewslydate, 'DOMException')
}

export function isDOMError(cNewslydate: unknown): boolean {
    return isBuiltin(cNewslydate, 'DOMError')
}

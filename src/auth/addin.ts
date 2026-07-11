/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { setApi } from '@/auth/api';

/**
 * Extends the global `Window` interface to include a custom property `geotab`.
 *
 * The `geotab` property is optional and provides an object that may contain an `addin` property.
 * The `addin` property, if present, is a record where keys are strings and values can be of any type.
 *
 * This structure is commonly used for extending functionality within a specific namespace for
 * custom integrations or add-ins.
 */
declare global {
    interface Window {
        geotab?: {
            addin?: Record<string, unknown>;
        };
    }
}

/**
 * Registers a Geotab add-in and initializes its lifecycle methods.
 *
 * @param {Function} startApp - A function that initializes and starts the add-in application.
 * @return {void} This function does not return a value.
 */
export function registerAddin(startApp: () => void): void {
    if (window.geotab?.addin) {
        window.geotab.addin.limousinesReports = () => ({
            initialize(api, state, callback) {
                setApi(api);
                startApp();
                callback();
            },
            focus() {},
            blur() {},
        });
    } else {
        startApp();
    }
}

import { exit } from 'process'
import * as fs from 'fs'

/**
 * Helper for error handling.
 */
export class ErrorHelper {
    /**
     * @param errorLogPath path to error log (e.g. error.log)
     */
    constructor(private errorLogPath: string) {}

    /**
     * Saves error information in error log.
     * @param error error object
     */
    HandleError(error: Error): void {
        if (this.errorLogPath === undefined) return
        fs.appendFileSync(this.errorLogPath, `${error.toString()}\n`)
        exit(1)
    }
}

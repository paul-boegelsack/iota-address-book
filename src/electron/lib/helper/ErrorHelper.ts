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
        const date = new Date().toString()
        const errorString = `${date}:\n${error.stack}\n\n`
        console.error(errorString)
        fs.appendFileSync(this.errorLogPath, errorString)
        exit(1)
    }
}

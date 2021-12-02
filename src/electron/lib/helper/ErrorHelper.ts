import { exit } from 'process'
import * as fs from 'fs'

export class ErrorHelper {
    constructor(private errorLogPath: string) {}

    HandleError(error: Error): void {
        if (this.errorLogPath === undefined) return
        fs.appendFileSync(this.errorLogPath, `${error.toString()}\n`)
        exit(1)
    }
}

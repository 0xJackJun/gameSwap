import { json } from '@graphprotocol/graph-ts';
import { exec } from 'child_process';
import { stringify } from 'node:querystring';

export function ReplaceLine(filename: string, srcStr: string, dstStr: string): any {
    let cmdStr = "sed -i -e   's/" + srcStr + "/" + dstStr + "/g' " + filename
    console.log(cmdStr);
    exec(cmdStr, function (err, stdout, stderr) { });
}
"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const analysisEngineHashes_1 = require("./analysisEngineHashes");
// '/etc/os-release', ID=flavor
const supportedLinuxFlavors = [
    'centos',
    'debian',
    'fedora',
    'ol',
    'opensuse',
    'rhel',
    'ubuntu'
];
class PlatformData {
    constructor(platform, fs) {
        this.platform = platform;
        this.fs = fs;
    }
    getPlatformName() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.platform.isWindows) {
                return this.platform.is64bit ? 'win-x64' : 'win-x86';
            }
            if (this.platform.isMac) {
                return 'osx-x64';
            }
            if (this.platform.isLinux) {
                if (!this.platform.is64bit) {
                    throw new Error('Python Analysis Engine does not support 32-bit Linux.');
                }
                const linuxFlavor = yield this.getLinuxFlavor();
                if (linuxFlavor.length === 0) {
                    throw new Error('Unable to determine Linux flavor from /etc/os-release.');
                }
                if (supportedLinuxFlavors.indexOf(linuxFlavor) < 0) {
                    throw new Error(`${linuxFlavor} is not supported.`);
                }
                return `${linuxFlavor}-x64`;
            }
            throw new Error('Unknown OS platform.');
        });
    }
    getEngineDllName() {
        return 'Microsoft.PythonTools.VsCode.dll';
    }
    getEngineExecutableName() {
        return this.platform.isWindows
            ? 'Microsoft.PythonTools.VsCode.exe'
            : 'Microsoft.PythonTools.VsCode';
    }
    getExpectedHash() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.platform.isWindows) {
                return this.platform.is64bit ? analysisEngineHashes_1.analysis_engine_win_x64_sha512 : analysisEngineHashes_1.analysis_engine_win_x86_sha512;
            }
            if (this.platform.isMac) {
                return analysisEngineHashes_1.analysis_engine_osx_x64_sha512;
            }
            if (this.platform.isLinux && this.platform.is64bit) {
                const linuxFlavor = yield this.getLinuxFlavor();
                // tslint:disable-next-line:switch-default
                switch (linuxFlavor) {
                    case 'centos': return analysisEngineHashes_1.analysis_engine_centos_x64_sha512;
                    case 'debian': return analysisEngineHashes_1.analysis_engine_debian_x64_sha512;
                    case 'fedora': return analysisEngineHashes_1.analysis_engine_fedora_x64_sha512;
                    case 'ol': return analysisEngineHashes_1.analysis_engine_ol_x64_sha512;
                    case 'opensuse': return analysisEngineHashes_1.analysis_engine_opensuse_x64_sha512;
                    case 'rhel': return analysisEngineHashes_1.analysis_engine_rhel_x64_sha512;
                    case 'ubuntu': return analysisEngineHashes_1.analysis_engine_ubuntu_x64_sha512;
                }
            }
            throw new Error('Unknown platform.');
        });
    }
    getLinuxFlavor() {
        return __awaiter(this, void 0, void 0, function* () {
            const verFile = '/etc/os-release';
            const data = yield this.fs.readFile(verFile);
            if (data) {
                const res = /ID=(.*)/.exec(data);
                if (res && res.length > 1) {
                    return res[1];
                }
            }
            return '';
        });
    }
}
exports.PlatformData = PlatformData;
//# sourceMappingURL=platformData.js.map
import axios from 'axios';
import { Logger } from '../utils/logger.js';
export class ZoraAPI {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.zora.co/universal/graphql',
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://zora.co',
                'Referer': 'https://zora.co/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });
        this.logger = new Logger();
    }
    async getCreatorInfo(tokenName, tokenSymbol) {
        const profileId = tokenSymbol || tokenName;
        if (!profileId) {
            this.logger.warn('No token name/symbol to check profile');
            return null;
        }
        this.logger.info(`Checking Zora profile: ${profileId}`);
        return this.getCreatorProfile(profileId);
    }
    async getCreatorProfile(profileId) {
        var _a;
        this.logger.info(`Getting profile info for: ${profileId}`);
        const query = {
            hash: '70139e5df4ed3d7e3601558cd21e5314',
            operationName: 'UserProfileWebQuery',
            variables: {
                profileId: profileId,
            },
        };
        try {
            this.logger.info('Sending profile request to Zora API...');
            const response = await this.client.post('', query);
            if (response.status === 200) {
                this.logger.info('Profile API request successful, parsing...');
                const profile = response.data.data.profile;
                if ((_a = profile === null || profile === void 0 ? void 0 : profile.socialAccounts) === null || _a === void 0 ? void 0 : _a.twitter) {
                    const twitter = profile.socialAccounts.twitter;
                    this.logger.info(`Found Twitter: @${twitter.username} (${twitter.followerCount} followers)`);
                    return {
                        username: twitter.username,
                        followers: twitter.followerCount,
                    };
                }
                else {
                    this.logger.info('Profile has no Twitter account');
                }
            }
            else {
                this.logger.warn(`Profile API request failed with status: ${response.status}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to get profile info', { error });
        }
        this.logger.info(`No Twitter info found for profile ${profileId}`);
        return null;
    }
}
//# sourceMappingURL=ZoraApi.js.map
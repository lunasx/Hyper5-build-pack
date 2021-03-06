"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceUtils = void 0;
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const StreamDispatcher_1 = require("./StreamDispatcher");
class VoiceUtils {
    /**
     * The voice utils
     * @private
     */
    constructor() {
        /**
         * The cache where voice utils stores stream managers
         * @type {Collection<Snowflake, StreamDispatcher>}
         */
        this.cache = new discord_js_1.Collection();
    }
    /**
     * Joins a voice channel, creating basic stream dispatch manager
     * @param {StageChannel|VoiceChannel} channel The voice channel
     * @param {object} [options={}] Join options
     * @returns {Promise<StreamDispatcher>}
     */
    connect(channel, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.join(channel, options);
            const sub = new StreamDispatcher_1.StreamDispatcher(conn, channel, options.maxTime);
            this.cache.set(channel.guild.id, sub);
            return sub;
        });
    }
    /**
     * Joins a voice channel
     * @param {StageChannel|VoiceChannel} [channel] The voice/stage channel to join
     * @param {object} [options={}] Join options
     * @returns {VoiceConnection}
     */
    join(channel, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let conn = voice_1.joinVoiceChannel({
                guildId: channel.guild.id,
                channelId: channel.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: Boolean(options.deaf)
            });
            try {
                conn = yield voice_1.entersState(conn, voice_1.VoiceConnectionStatus.Ready, (_a = options === null || options === void 0 ? void 0 : options.maxTime) !== null && _a !== void 0 ? _a : 20000);
                return conn;
            }
            catch (err) {
                conn.destroy();
                throw err;
            }
        });
    }
    /**
     * Disconnects voice connection
     * @param {VoiceConnection} connection The voice connection
     * @returns {void}
     */
    disconnect(connection) {
        if (connection instanceof StreamDispatcher_1.StreamDispatcher)
            return connection.voiceConnection.destroy();
        return connection.destroy();
    }
    /**
     * Returns Discord Player voice connection
     * @param {Snowflake} guild The guild id
     * @returns {StreamDispatcher}
     */
    getConnection(guild) {
        return this.cache.get(guild);
    }
}
exports.VoiceUtils = VoiceUtils;

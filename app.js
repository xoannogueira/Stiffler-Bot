import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import axios from 'axios';

// Create an express app
const app = express();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const guildId = '722178220484460585';
const channelId = '1225167896192356425';
const hostId = '1235524838320508989';
const roleId1 = '1235343578239209513';
const roleId2 = '1235523396482240552';
const roleId3 = '1235523433119617064';
const stifflerId = '1235562033500524647';
let members = [];
let after = 0;

// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

    async function unmuteMember(member) {
      try {
        await axios.patch(`https://discord.com/api/guilds/${guildId}/members/${member.user.id}`, {
          channel_id: channelId,
          mute: false
        }, {
          headers: {
            'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
    
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              unmuteMember(member).then(resolve).catch(reject);
            }, retryAfter);
          });
        } else {
          throw error;
        }
      }
    }
    
    async function muteMember(member) {
      try {
        await axios.patch(`https://discord.com/api/guilds/${guildId}/members/${member.user.id}`, {
          channel_id: channelId,
          mute: true
        }, {
          headers: {
            'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
    
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              muteMember(member).then(resolve).catch(reject);
            }, retryAfter);
          });
        } else {
          throw error;
        }
      }
    }
    
    if(data.custom_id == 'muteAll'){
      members.forEach(async member => {
        if (!member.roles.includes(hostId)){
          if (member.roles.includes(stifflerId)){
            await muteMember(member);
            await delay(1000);
          }
        }
      });
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      });
    }

    if(data.custom_id == 'speakerTeam1'){
      members.forEach(async member => {
        if (!member.roles.includes(hostId)){
          if (!member.roles.includes(roleId1)){
            await muteMember(member);
          }
        }
      });
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      });
    }
    
    if(data.custom_id == 'speakerTeam2'){
      members.forEach(async member => {
        if (!member.roles.includes(hostId)){
          if (!member.roles.includes(roleId2)){
            await muteMember(member);
          }
        }
      });
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      });
    }
  
    if(data.custom_id == 'speakerTeam3'){
      members.forEach(async member => {
        if (!member.roles.includes(hostId)){
          if (!member.roles.includes(roleId3)){
            await muteMember(member);
          }
        }
      });
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      });
    }
  

    if(data.custom_id == 'entmuteAll'){
      members.forEach(async member => {
        // Unmute the member
        if (member.roles.includes(stifflerId)){
          await unmuteMember(member);
          await delay(1000);
        }
      });
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      });
    }


  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    // "mute" command
    if (name === 'mute') {
      const allowedRoleId = '1235524838320508989';
      // The member who triggered the interaction
      const member = req.body.member.roles;
      while (true) {
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members?limit=1000&after=${after}`, {
          headers: {
            'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
          }
        });
      
        members = members.concat(response.data);
      
        if (response.data.length < 1000) {
          break;
        }
      
        after = response.data[response.data.length - 1].user.id;
      }
      members = members.filter(member => member.roles.includes(stifflerId));

      // If the interaction is not a command or was used in a direct message, member will be undefined
      if (!member) {
        // Handle this situation (for example, by sending a response or ignoring the interaction)
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "You don't have permission to use this command.",
          },
        });
      }

      // Send a message into the channel where command was triggered from
      // Check if the member has the required role
      if (!member.includes(allowedRoleId)) {
        // The member does not have the required role, send a response indicating that they don't have permission
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "You don't have permission to use this command.",
          },
        });
      }
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'Wähle ein Befehl aus',
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'muteAll',
                  label: 'Mute All',
                  style: ButtonStyleTypes.PRIMARY,
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'speakerTeam1',
                  label: 'Speaker Team 1',
                  style: ButtonStyleTypes.PRIMARY,
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'speakerTeam2',
                  label: 'Speaker Team 2',
                  style: ButtonStyleTypes.PRIMARY,
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'speakerTeam3',
                  label: 'Speaker Team 3',
                  style: ButtonStyleTypes.PRIMARY,
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'entmuteAll',
                  label: 'Entmute All',
                  style: ButtonStyleTypes.PRIMARY,
                }
              ],
            },
          ],
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

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

const guildId = '722178220484460585';
const channelId = '1225167896192356425';
const hostId = '1235524838320508989';

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

  if(data.custom_id == 'muteAll'){
  
    // Get the list of members in the voice channel
    const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });
    
    // Iterate over all members in the voice channel
      response.data.forEach(async member => {
        if (!member.roles.includes(hostId)){
          // Mute the member
          await axios.patch(`https://discord.com/api/guilds/${guildId}/members/${member.user.id}`, {
            channel_id: channelId,
            mute: true
          }, {
            headers: {
              'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            }
          });
        }
      });
  
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    });
  }

  if(data.custom_id == 'speakerTeam1'){
    // Get the guild (server) from the interaction
    const roleId = '1235343578239209513';
  
    // Get all members of the guild
    const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });
    // Iterate over all members
    response.data.forEach(async member => {
      // Check if the member has the role
      if (!member.roles.includes(hostId)){
        if (!member.roles.includes(roleId)) {
          // Mute the member
          await axios.patch(`https://discord.com/api/guilds/${guildId}/members/${member.user.id}`, {
            mute: true
          }, {
            headers: {
              'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            }
          });
        }
      }
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    });
  }

  if(data.custom_id == 'speakerTeam2'){
    // Get the guild (server) from the interaction
    const roleId = '1235523396482240552';
  
    // Get all members of the guild
    const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });

    // Iterate over all members
    response.data.forEach(async member => {
      // Check if the member has the role
      if (!member.roles.includes(hostId)){
        if (!member.roles.includes(roleId)) {
          // Mute the member
          await axios.patch(`https://discord.com/api/guilds/${guildId}/members/${member.user.id}`, {
            mute: true
          }, {
            headers: {
              'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            }
          });
        }
      }
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    });
  }

  if(data.custom_id == 'speakerTeam3'){
    // Get the guild (server) from the interaction
    const roleId = '1235523433119617064';
  
    // Get all members of the guild
    const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });

    // Iterate over all members
    response.data.forEach(async member => {
      // Check if the member has the role
      if (!member.roles.includes(hostId)){
        if (!member.roles.includes(roleId)) {
          // Mute the member
          await axios.patch(`https://discord.com/api/guilds/${guildId}/members/${member.user.id}`, {
            mute: true
          }, {
            headers: {
              'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            }
          });
        }
      }
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    });
  }

  if(data.custom_id == 'entmuteAll'){
    // Get the list of members in the voice channel
    const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });
    // Iterate over all members in the voice channel
    response.data.forEach(async member => {
      // Unmute the member
      await axios.patch(`https://discord.com/api/guilds/${guildId}/members/${member.user.id}`, {
        channel_id: channelId,
        mute: false
      }, {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
        }
      });
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

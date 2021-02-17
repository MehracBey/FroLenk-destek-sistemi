const FroLenk = require("discord.js");
const client = (global.client = new FroLenk.Client());
const fs = require("fs");
const ayarlar = require('./ayarlar.json');
const moment = require("moment");
const Jimp = require("jimp");
const chalk = require("chalk");
client.conf = {
  token: "TOKEN ENV KISMINA", // Botun tokeni
  durum: "dnd", // Botun Durumu idle,dnd,online
  destekkanalid: "701541704934621184", // Destek Açılacak Kanal id
  destekrolid: "698493036715442187", // Destek Yetkilisi Rolü id
  destekkategoriid: "782261366887022622", // Açılan Desteklerin Kategori id
  kapalidestekkategoriid: "809450580149010462", // Kapanan Desteklerin Kategori id
  
  kategori1: "DESTEKLER", // Kategori İsmi Örn: Destek sistemi

  kategori1emoji: "753929555030573146", // Kategori Emoji ID Örnek: 753929555030573146  yaptığınız emoji id sunucunuzda bulunmalı!

  kategori1kisaltma: "acık", // Kanal için kategori Kısaltması Örnek: Teknik Olanlar destek-999-teknik gibi isimleri olur

};
var pref = ayarlar.prefix;
client.on("message", message => {
  if (message.channel.type === "dm") return;
  let prefix = pref;
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let command = message.content.split(" ")[0].slice(prefix.length);
  let params = message.content.split(" ").slice(1);
  let perms = client.elevation(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
});

client.on("ready", async () => {
  console.log(`Bütün Komutlar Başarıyla Yüklendi:)`);
  client.user.setStatus(client.conf.durum);
  setInterval(function() {
    let destekno = db.fetch("desteknumara");
    var oyun = [
      `FroLenk Bot`,
      `ByMySpanık#0514 Sahibim`,
      `AntiCode Development`,
      `Çalana Mokoko`,
      `Spanikten Sevgiler`,
      
    ];
   var random = Math.floor(Math.random() * (oyun.length - 0 + 1) + 0);
    client.user.setActivity(oyun[random]);
  }, 2 * 2500);

  console.log(`FroLenk Bot AKTİF!`);
});

const log = message => {
  console.log(`FroLenk | ${message}`);
};

client.commands = new FroLenk.Collection();
client.aliases = new FroLenk.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(
    `> ${files.length} adet komut yüklenmeye hazır. Başlatılıyor...`
  );
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if (message.member.hasPermission("MANAGE_ROLES")) permlvl = 2;
  if (message.member.hasPermission("MANAGE_CHANNELS")) permlvl = 3;
  if (message.member.hasPermission("KICK_MEMBERS")) permlvl = 4;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 5;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 6;
  if (message.author.id === message.guild.ownerID) permlvl = 7;
  if (message.author.id === client.conf.own) permlvl = 8;
  return permlvl;
};
const db = require("quick.db");
client.on("message", async msg => {
  if (msg.channel.type === "dm") return;
  let destekkanal = client.conf.destekkanalid;
  let destekrol = client.conf.destekrolid;
  let kategori = client.conf.destekkategoriid;
  let durum2 = db.get(`durumkullanici.${msg.author.id}.${msg.guild.id}`);
  let durum = db.get(`durumkisi.${durum2}`);
  const reason = msg.content
    .split(" ")
    .slice(1)
    .join(" ");
  if (msg.channel.id === destekkanal) {
    let kisi = msg.author.id;
    if (msg.author.bot) return;
    if (!msg.guild.roles.cache.has(destekrol))
      return msg.channel.send(
        `Sunucuda, belirtilen destek rolü bulunmadığı için destek talebi açılamadı!`
      );
    if (durum) {
      msg.author.send("Zaten açıkbir destek talebin var!");
      msg.delete();
      return;
    }

    

    if (msg.guild.channels.cache.get(kategori)) {
      let role = msg.guild.roles.cache.get(destekrol);
      let destekno = await db.fetch(`desteknumara_${msg.guild.id}`);
      db.add(`desteknumara_${msg.guild.id}`, +1);
      const category = msg.guild.channels.cache.get(kategori);
      msg.guild.channels
        .create(`destek-${destekno}`, { type: "text", reason: "Destek" })
        .then(c => {
          c.setParent(category);
          c.overwritePermissions([
            {
              id: role.id,
              allow: ["VIEW_CHANNEL"],
              deny: ["SEND_MESSAGES"]
            },
            {
              id: msg.guild.roles.everyone,
              deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
            },
            {
              id: msg.author.id,
              allow: ["VIEW_CHANNEL"],
              deny: ["SEND_MESSAGES"]
            }
          ]);
          db.set(`durumnokisi.${msg.author.id}.${msg.guild.id}`, destekno);
          db.set(`durumkullanici.${msg.author.id}.${msg.guild.id}`, c.id);
          db.set(`durumkisi.${c.id}`, msg.author.id);
          let kisi2 = db.fetch(`durumkisi.${c.id}`);
          const embed = new FroLenk.MessageEmbed()
            .setAuthor(
              "Hoşgeldin " + msg.author.username,
              msg.author.avatarURL({ dynamic: true })
            )
            .setThumbnail(
              "https://discord.com/channels/697884391413907456/811184405032599572/811293239554474024"
            )
            .setColor("RED")
            .addField(
              `**FroLenk destek**`,
              `Destek sistemini kullandığın için teşekkürler.\nGereği Dışında Kullnımı Ceza Sebebidir!\n**Alttaki emojiye basarsanız destek talebiniz açılmış olur.**`
            )
            .setFooter(
              `FroLenk Destek Sistemi`,
              client.user.avatarURL()
            )
            .setTimestamp();
          msg.delete();
          c.send(embed).then(embed22 => {
            let boyut = 0;
            embed22.react(client.conf.kategori1emoji);
            const filter1 = (reaction, user) => {
              return (
                reaction.emoji.id === client.conf.kategori1emoji &&
                user.id === kisi2
              );
            };

            const collector1 = embed22.createReactionCollector(filter1, {
              time: 3000000
            });

            collector1.on("collect", (reaction, user) => {
              let boyut = 1;
              embed22.delete();
              embed22.channel.overwritePermissions([
                {
                  id: role.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.guild.roles.everyone,
                  deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.author.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                }
              ]);
              embed22.channel.setName(
                "destek-" + destekno + "-" + client.conf.kategori1kisaltma
              );
              const embed3 = new FroLenk.MessageEmbed()
                .setColor("YELLOW")
                .setThumbnail(
                  ""
                )
                .addField(
                  `Merhaba ${msg.author.username}!`,
                  `Birazdan Seninle Destek Ekibimiz iletişime geçer. Lütfen sabırla bekleyiniz.\nDestek talebini kapatmak için \`talep kapat\` yazabilirsin.\n Destek No: **${destekno}**`
                )
                .addField(`» Kullanıcı:`, msg.author, true)
                .addField(`» Talep Konusu/Sebebi:`, msg.content, true)
                .setFooter(
                  `FroLenk Destek Sistemi`,
                  client.user.avatarURL()
                )
                .setTimestamp();
              embed22.channel.send(embed3);
              embed22.channel.send(
                `${msg.author.username} Destek Talebi Açtı @here!`
              );
            });
            const filter2 = (reaction, user) => {
              return (
                reaction.emoji.id === client.conf.kategori2emoji &&
                user.id === kisi2
              );
            };

            const collector2 = embed22.createReactionCollector(filter2, {
              time: 3000000
            });

            collector2.on("collect", (reaction, user) => {
              let boyut = 1;
              embed22.delete();
              embed22.channel.overwritePermissions([
                {
                  id: role.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.guild.roles.everyone,
                  deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.author.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                }
              ]);
              embed22.channel.setName(
                "destek-" + destekno + "-" + client.conf.kategori2kisaltma
              );
              const embed3 = new FroLenk.MessageEmbed()
                .setColor("YELLOW")
                .setThumbnail(
                  "https://cdn.discordapp.com/avatars/716313744900227083/abb190ffed161badde384190d3446db6.jpg?size=2048"
                )
                .addField(
                  `Merhaba ${msg.author.username}!`,
                  `Destek yetkilileri burada seninle ilgilenecektir. \nDestek talebini kapatmak için \`talep kapat\` yazabilirsin.`
                )
                .addField(`» Kullanıcı:`, msg.author, true)
                .addField(`» Talep Konusu/Sebebi:`, msg.content, true)
                .setFooter(
                  `FroLenk Destek Sistemi`,
                  client.user.avatarURL()
                )
                .setTimestamp();
              embed22.channel.send(embed3);
              embed22.channel.send(
                `${msg.author.username} Destek Talebi Açtı @here!`
              );
            });
            const filter3 = (reaction, user) => {
              return (
                reaction.emoji.id === client.conf.kategori3emoji &&
                user.id === kisi2
              );
            };

            const collector3 = embed22.createReactionCollector(filter3, {
              time: 3000000
            });

            collector3.on("collect", (reaction, user) => {
              let boyut = 1;
              embed22.delete();
              embed22.channel.overwritePermissions([
                {
                  id: role.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.guild.roles.everyone,
                  deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.author.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                }
              ]);
              embed22.channel.setName(
                "destek-" + destekno + "-" + client.conf.kategori3kisaltma
              );
              const embed3 = new FroLenk.MessageEmbed()
                .setColor("YELLOW")
                .setThumbnail(
                  "https://discord.com/api/oauth2/authorize?client_id=791932586250207232&permissions=8&scope=bot"
                )
                .addField(
                  `Merhaba ${msg.author.username}!`,
                  `Destek yetkilileri burada seninle ilgilenecektir. \nDestek talebini kapatmak için \`talep kapat\` yazabilirsin.`
                )
                .addField(`» Kullanıcı:`, msg.author, true)
                .addField(`» Talep Konusu/Sebebi:`, msg.content, true)
                .setFooter(
                  `FroLenk Destek Sistemi`,
                  client.user.avatarURL()
                )
                .setTimestamp();
              embed22.channel.send(embed3);
              embed22.channel.send(
                `${msg.author.username} Destek Talebi Açtı @here!`
              );
            });

                        const filter4 = (reaction, user) => {
              return (
                reaction.emoji.id === client.conf.kategori4emoji &&
                user.id === kisi2
              );
            };

            const collector4 = embed22.createReactionCollector(filter4, {
              time: 3000000
            });

            collector4.on("collect", (reaction, user) => {
              let boyut = 1;
              embed22.delete();
              embed22.channel.overwritePermissions([
                {
                  id: role.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.guild.roles.everyone,
                  deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                  id: msg.author.id,
                  allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                }
              ]);
              embed22.channel.setName(
                "destek-" + destekno + "-" + client.conf.kategori4kisaltma
              );
              const embed3 = new FroLenk.MessageEmbed()
                .setColor("YELLOW")
                .setThumbnail(
                  "https://discord.com/api/oauth2/authorize?client_id=791932586250207232&permissions=8&scope=bot"
                )
                .addField(
                  `Merhaba ${msg.author.username}!`,
                  `Destek yetkilileri burada seninle ilgilenecektir. \nDestek talebini kapatmak için \`talep kapat\` yazabilirsin.`
                )
                .addField(`» Kullanıcı:`, msg.author, true)
                .addField(`» Talep Konusu/Sebebi:`, msg.content, true)
                .setFooter(
                  `FroLenk Destek Sistemi`,
                  client.user.avatarURL()
                )
                .setTimestamp();
              embed22.channel.send(embed3);
              embed22.channel.send(
                `${msg.author.username} Destek Talebi Açtı @here!`
              );
            });
          });
        })
        .catch(console.error);
    }
  }
});

client.on("message", message => {
  if (message.channel.type === "dm") return;
  const db = require("quick.db");
  if (message.content.toLowerCase() === "talep kapat") {
    if (!message.channel.name.startsWith(`destek-`)) return;
    if (message.author.bot) return;
    message.channel
      .send(
        `Destek talebini kapatmayı onaylıyorsan **10 saniye** içinde  \`evet\`  yazmalısın!`
      )
      .then(m => {
        message.channel
          .awaitMessages(
            response => response.content.toLowerCase() === "evet",
            {
              max: 1,
              time: 10000,
              errors: ["time"]
            }
          )
          .then(collected => {
            let kisi2 = db.fetch(`durumkisi.${message.channel.id}`);
            message.channel.setParent(client.conf.kapalidestekkategoriid);
            message.channel
              .overwritePermissions([
                {
                  id: message.guild.roles.everyone,
                  deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                }
              ])
              .then(c => {
                let kisi = db.fetch(`durumkisi.${message.channel.id}`);
                let no = db.fetch(`durumnokisi.${kisi}.${message.guild.id}`);
                let destekno = db.fetch(`desteknumara_${message.guild.id}`);
                message.channel.setName("Kapalı-Talep-" + no);
                db.delete(`durumkullanici.${kisi}`);
                db.delete(`durumnokisi.${kisi}`);
              })
              .catch(console.error);
          })
          .catch(() => {
            m.edit("Destek Talebi kapatma isteğin zaman aşımına uğradı!").then(
              m2 => {
                m2.delete();
              },
              3000
            );
          });
      });
  }
});

client.on("channelDelete", channel => {
  let kisi = db.fetch(`durumkisi.${channel.id}`);
  db.delete(`durumkullanici.${kisi}`);
});
client.on("message", async message => {
  if (message.channel.type === "dm") return;
  const db = require("quick.db");
  function delay(sec) {
    return new Promise(res => {
      setTimeout(() => {
        res();
      }, sec * 1000);
    });
  }

  if (message.content.toLowerCase() === "talep sil") {
    if (!message.channel.name.startsWith(`kapalı-talep-`)) return;
    if (message.author.bot) return;
    message.channel
      .send(
        `Destek talebini silmeyi onaylıyorsan **10 saniye** içinde  \`evet\`  yazmalısın!`
      )
      .then(async m => {
        message.channel
          .awaitMessages(
            response => response.content.toLowerCase() === "evet",
            {
              max: 1,
              time: 10000,
              errors: ["time"]
            }
          )
          .then(async collected => {
            let destekno = db.fetch(`desteknumara_${message.guild.id}`);
            await delay(5);
            message.channel.delete();
          })
          .catch(() => {
            m.edit("Destek Talebi kapatma isteğin zaman aşımına uğradı!").then(
              m2 => {
                m2.delete();
              },
              3000
            );
          });
      });
  }
});


client.login(process.env.TOKEN)
